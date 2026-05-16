const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Meal = require('../models/Meal');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const MealFeedback = require('../models/MealFeedback');
const { getTargets } = require('../utils/nutrition');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getTodayDate = () => new Date().toISOString().split('T')[0];

async function preparePlanResponse(plan, user) {
  const userId = user.uid;
  const today = getTodayDate();
  const MealLog = require('../models/MealLog');
  
  const logs = await MealLog.find({ userId, date: today });
  const planObj = plan.toObject ? plan.toObject() : plan;
  
  planObj.meals = planObj.meals.map(m => {
    const mId = m.mealId?._id || m.mealId;
    const log = mId ? logs.find(l => l.mealId && l.mealId.toString() === mId.toString()) : null;
    return {
      ...m,
      eaten: log ? log.eaten : (m.completed || false),
      rating: log ? log.rating : 0
    };
  });

  planObj.userBudget = user.budget_per_day_ghs || 150;
  return planObj;
}

async function generateDailyPlan(user, extraExcludeIds = []) {
  const userId = user.uid;
  const today = getTodayDate();
  const targets = getTargets(user);
  const dailyBudget = user.budget_per_day_ghs || 150;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentPlans = await MealPlan.find({ userId, createdAt: { $gte: sevenDaysAgo } }).lean();
  const usedMealIds = recentPlans.flatMap(p => p.meals.map(m => (m.mealId?._id || m.mealId)?.toString())).filter(Boolean);
  const activeDislikes = (user.dislikedMeals || []).filter(d => d.expiresAt > new Date()).map(d => d.mealId.toString());
  const excludeIds = [...new Set([...usedMealIds, ...activeDislikes, ...extraExcludeIds])];

  async function findCandidates(strict = true) {
    const query = { _id: { $nin: excludeIds } };
    if (strict) {
      query.cost_ghs = { $lte: (dailyBudget / 2) }; 
      if (user.allergies?.length) query.tags = { $nin: user.allergies };
    } else {
      query.cost_ghs = { $lte: dailyBudget };
    }
    return await Meal.find(query).limit(100).lean();
  }

  let candidates = await findCandidates(true);
  if (candidates.length < 5) candidates = await findCandidates(false);

  // 3. DB-First Selection (Prioritizing correct types)
  const breakfasts = candidates.filter(m => m.type === 'Breakfast');
  const lunches = candidates.filter(m => m.type === 'Lunch');
  const dinners = candidates.filter(m => m.type === 'Dinner');
  const anyType = candidates.filter(m => m.type === 'Any');

  const b = breakfasts[Math.floor(Math.random() * breakfasts.length)] || anyType[0];
  const l = lunches.find(m => m._id?.toString() !== b?._id?.toString()) || anyType.find(m => m._id?.toString() !== b?._id?.toString());
  const d = dinners.find(m => m._id?.toString() !== b?._id?.toString() && m._id?.toString() !== l?._id?.toString()) || anyType.find(m => m._id?.toString() !== b?._id?.toString() && m._id?.toString() !== l?._id?.toString());

  if (b && l && d) {
    const meals = [
      { ...b, mealId: b._id, type: 'Breakfast', reason: 'Healthy breakfast choice' },
      { ...l, mealId: l._id, type: 'Lunch', reason: 'Energizing lunch' },
      { ...d, mealId: d._id, type: 'Dinner', reason: 'Perfect dinner to end your day' }
    ];
    const newPlan = new MealPlan({
      userId, date: today,
      meals,
      total_cal: meals.reduce((sum, m) => sum + (m.calories || 0), 0),
      total_cost_ghs: meals.reduce((sum, m) => sum + (m.cost_ghs || 0), 0)
    });
    await newPlan.save();
    return newPlan;
  }

  // AI Fallback
  const prompt = `Act as an elite Ghanaian nutritionist. Generate a 3-meal plan (Breakfast, Lunch, Dinner) for a ${targets.calories}kcal diet with a ${dailyBudget}GHS budget. 
  IMPORTANT: Follow Ghanaian meal traditions:
  - Breakfast: Koko (Hausa, Millet, Corn), Porridge, Bread, Eggs, Koose, or Tom Brown.
  - Lunch: Heavier meals like Jollof, Waakye, Banku, Fufu, Rice, or Yam.
  - Dinner: Lighter meals like Light Soup, Salad, Grilled Fish, or small portions of lunch items.
  
  Return ONLY JSON: {"meals": [{"type": "Breakfast", "name": "...", "calories": 0, "cost_ghs": 0, "protein": 0, "carbs": 0, "fat": 0, "reason": "...", "ingredients": [{"name": "...", "qty": 0, "unit": "...", "cost_ghs": 0}], "instructions": "..."}]}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const planData = JSON.parse(jsonStr);
    
    const planMeals = [];
    for (const m of planData.meals) {
      const savedMeal = new Meal({ 
        ...m, 
        cuisine: 'Ghanaian', 
        type: m.type,
        instructions: Array.isArray(m.instructions) ? m.instructions.join('. ') : m.instructions
      });
      await savedMeal.save();
      planMeals.push({ ...m, mealId: savedMeal._id });
    }

    const newPlan = new MealPlan({
      userId, date: today,
      meals: planMeals,
      total_cal: planMeals.reduce((sum, m) => sum + m.calories, 0),
      total_cost_ghs: planMeals.reduce((sum, m) => sum + m.cost_ghs, 0)
    });
    await newPlan.save();
    return newPlan;
  } catch (err) {
    console.error("AI Error:", err);
    const fallbackMeals = await Meal.find({}).limit(3).lean();
    const fallbackPlan = new MealPlan({
      userId, date: today,
      meals: fallbackMeals.map((m, i) => ({
        ...m, mealId: m._id, type: i === 0 ? 'Breakfast' : i === 1 ? 'Lunch' : 'Dinner', reason: 'Selected from our top recipes'
      })),
      total_cal: fallbackMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      total_cost_ghs: fallbackMeals.reduce((sum, m) => sum + (m.cost_ghs || 0), 0)
    });
    await fallbackPlan.save();
    return fallbackPlan;
  }
}

router.get('/today', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const today = getTodayDate();
    let existingPlan = await MealPlan.findOne({ userId, date: today }).populate('meals.mealId');
    if (!existingPlan) {
      existingPlan = await generateDailyPlan(user);
    }
    const planObj = await preparePlanResponse(existingPlan, user);
    res.json(planObj);
  } catch (err) {
    console.error("GET today error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const { userId, mealId, rating, feedback } = req.body;
    const newFeedback = new MealFeedback({ userId, mealId, rating, feedback });
    await newFeedback.save();
    if (rating <= 2) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);
      await User.findOneAndUpdate({ uid: userId }, { $push: { dislikedMeals: { mealId, expiresAt } } });
    }
    res.json({ message: 'Feedback saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/today', async (req, res) => {
  try {
    const { userId } = req.query;
    await MealPlan.findOneAndDelete({ userId, date: getTodayDate() });
    res.json({ message: 'Cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const history = await MealPlan.find({ userId: req.params.userId }).sort({ date: -1 }).populate('meals.mealId');
    const logs = await require('../models/MealLog').find({ userId: req.params.userId });
    const merged = history.map(plan => {
      const planObj = plan.toObject();
      planObj.meals = planObj.meals.map(m => {
        const mId = m.mealId?._id || m.mealId;
        const log = mId ? logs.find(l => l.date === plan.date && l.mealId.toString() === mId.toString()) : null;
        return { ...m, eaten: log ? log.eaten : false, rating: log ? log.rating : 0 };
      });
      return planObj;
    });
    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/swap-single', async (req, res) => {
  try {
    const { userId, mealId, index } = req.body;
    const user = await User.findOne({ uid: userId });
    const today = getTodayDate();
    let plan = await MealPlan.findOne({ userId, date: today }).populate('meals.mealId');
    if (!plan) return res.status(404).json({ message: 'No plan' });
    
    let mealIndex = (index !== undefined) ? index : plan.meals.findIndex(m => (m.mealId?._id || m.mealId).toString() === mealId);
    if (mealIndex === -1) return res.status(400).json({ message: 'Not found' });
    
    const mealType = plan.meals[mealIndex].type;
    const currentIds = plan.meals.map(m => (m.mealId?._id || m.mealId).toString());

    // Exclude the current meal and its counterparts from the search
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPlans = await MealPlan.find({ userId, createdAt: { $gte: sevenDaysAgo } }).lean();
    const usedMealIds = recentPlans.flatMap(p => p.meals.map(m => (m.mealId?._id || m.mealId)?.toString())).filter(Boolean);
    const excludeIds = [...new Set([...currentIds, ...usedMealIds])];

    // Find up to 20 candidates and pick one randomly for variety
    let candidates = await Meal.find({ 
      _id: { $nin: excludeIds }, 
      cost_ghs: { $lte: user.budget_per_day_ghs || 150 }, 
      type: mealType 
    }).limit(20).lean();

    if (candidates.length === 0) {
      candidates = await Meal.find({ _id: { $nin: excludeIds }, type: mealType }).limit(20).lean();
    }
    
    if (candidates.length === 0) {
      // If we've literally used everything in 7 days, at least exclude today's current meals
      candidates = await Meal.find({ _id: { $nin: currentIds }, type: mealType }).limit(20).lean();
    }

    if (candidates.length === 0) return res.status(404).json({ message: 'No replacement available' });

    // Pick one randomly from candidates
    const replacement = candidates[Math.floor(Math.random() * candidates.length)];

    plan.meals.set(mealIndex, {
      mealId: replacement._id, 
      type: mealType, 
      eaten: false, 
      rating: 0,
      name: replacement.name, 
      calories: replacement.calories, 
      protein: replacement.protein_g, 
      carbs: replacement.carbs_g, 
      fat: replacement.fat_g,
      prep_time_min: replacement.prep_time_min, 
      cost_ghs: replacement.cost_ghs, 
      reason: 'Swapped for a fresh option'
    });

    plan.total_cal = plan.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    plan.total_cost_ghs = plan.meals.reduce((sum, m) => sum + (m.cost_ghs || 0), 0);
    
    await plan.save();
    const updated = await MealPlan.findById(plan._id).populate('meals.mealId');
    const planObj = await preparePlanResponse(updated, user);
    res.json(planObj);
  } catch (err) {
    console.error("Swap error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/grocery/week', async (req, res) => {
  try {
    const { userId } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const plans = await MealPlan.find({ userId, createdAt: { $gte: sevenDaysAgo } }).populate('meals.mealId');
    const ingredientMap = {};
    let totalCost = 0;
    plans.forEach(plan => {
      plan.meals.forEach(mealItem => {
        const meal = mealItem.mealId;
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ing => {
            const key = `${ing.name.toLowerCase()}-${ing.unit.toLowerCase()}`;
            if (!ingredientMap[key]) {
              ingredientMap[key] = { name: ing.name, qty: 0, unit: ing.unit, cost_ghs: 0, category: categorizeIngredient(ing.name) };
            }
            ingredientMap[key].qty += ing.qty;
            ingredientMap[key].cost_ghs += ing.cost_ghs;
            totalCost += ing.cost_ghs;
          });
        }
      });
    });
    const items_by_category = {};
    Object.values(ingredientMap).forEach(item => {
      if (!items_by_category[item.category]) items_by_category[item.category] = [];
      items_by_category[item.category].push(item);
    });
    res.json({ items_by_category, total_cost_ghs: Math.round(totalCost * 100) / 100, meals_included: plans.length * 3 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/recipe/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

function categorizeIngredient(name) {
  const n = name.toLowerCase();
  const categories = {
    protein: ['chicken', 'beef', 'fish', 'meat', 'goat', 'pork', 'egg', 'tofu', 'shrimp', 'turkey', 'mackerel', 'tilapia', 'snapper', 'crab', 'herring'],
    vegetable: ['tomato', 'onion', 'pepper', 'spinach', 'kontomire', 'okra', 'carrot', 'cucumber', 'cabbage', 'lettuce', 'garden egg', 'bok choy', 'ayoyo'],
    starch: ['rice', 'yam', 'plantain', 'cassava', 'maize', 'corn', 'bread', 'pasta', 'noodles', 'bulgur', 'quinoa', 'potato', 'sweet potato', 'fonio', 'akyeke'],
    dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
    spice: ['ginger', 'garlic', 'curry', 'thyme', 'maggi', 'salt', 'shito', 'pepper powder', 'dawadawa'],
    other: ['oil', 'water', 'honey', 'sugar', 'sauce', 'peanut', 'agushie']
  };
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(k => n.includes(k))) return cat;
  }
  return 'other';
}

router.get('/feedback-status', async (req, res) => {
  try {
    const { userId } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFeedbacks = await MealFeedback.find({ userId, date: { $gte: sevenDaysAgo } }).populate('mealId');
    const highRatings = recentFeedbacks.filter(f => f.rating >= 4);
    const tagCounts = {};
    highRatings.forEach(f => {
      if (f.mealId && f.mealId.tags) f.mealId.tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
    });
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(t => t[0]);
    res.json({ rated_count: recentFeedbacks.length, has_high_rating: highRatings.length > 0, last_rating_tags: sortedTags });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/plan/add', async (req, res) => {
  try {
    const { userId, mealId, type } = req.body;
    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    let plan = await MealPlan.findOne({ userId, date: getTodayDate() });
    const mealEntry = { mealId: meal._id, type: type || 'Extra', name: meal.name, calories: meal.calories, cost_ghs: meal.cost_ghs, prep_time_min: meal.prep_time_min, reason: 'Manually added', completed: false };
    if (plan) {
      plan.meals.push(mealEntry);
      plan.total_cal += meal.calories;
      plan.total_cost_ghs += meal.cost_ghs;
      await plan.save();
    } else {
      plan = new MealPlan({ userId, date: getTodayDate(), meals: [mealEntry], total_cal: meal.calories, total_cost_ghs: meal.cost_ghs });
      await plan.save();
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/remove', async (req, res) => {
  try {
    const { userId, mealId, index } = req.body;
    let plan = await MealPlan.findOne({ userId, date: getTodayDate() });
    if (!plan) return res.status(404).json({ message: 'No plan' });
    if (index !== undefined) plan.meals.splice(index, 1);
    else plan.meals = plan.meals.filter(m => (m.mealId?._id || m.mealId).toString() !== mealId.toString());
    plan.total_cal = plan.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    plan.total_cost_ghs = plan.meals.reduce((sum, m) => sum + (m.cost_ghs || 0), 0);
    await plan.save();
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/log', async (req, res) => {
  try {
    const { userId, mealId, date, eaten, rating } = req.body;
    const MealLog = require('../models/MealLog');
    if (!eaten) {
      await MealLog.findOneAndDelete({ userId, mealId, date });
      return res.json({ message: 'Log removed' });
    }
    const log = await MealLog.findOneAndUpdate({ userId, mealId, date }, { eaten, rating, logged_at: new Date() }, { upsert: true, new: true });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findOne({ uid: userId });
    const today = getTodayDate();
    const oldPlan = await MealPlan.findOne({ userId, date: today });
    const oldMealIds = oldPlan ? oldPlan.meals.map(m => (m.mealId?._id || m.mealId).toString()) : [];
    await MealPlan.findOneAndDelete({ userId, date: today });
    const newPlan = await generateDailyPlan(user, oldMealIds);
    const planObj = await preparePlanResponse(newPlan, user);
    res.json(planObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
