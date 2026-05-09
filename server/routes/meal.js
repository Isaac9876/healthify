const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Meal = require('../models/Meal');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const MealFeedback = require('../models/MealFeedback');
const { getTargets } = require('../utils/nutrition');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to get today's date in YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

/**
 * Helper to generate a fresh meal plan for a user
 */
async function generateDailyPlan(user) {
  const userId = user.uid;
  const today = getTodayDate();
  const targets = getTargets(user);

  // 1. Filter meals from database
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentPlans = await MealPlan.find({ 
    userId, 
    createdAt: { $gte: sevenDaysAgo } 
  });
  const usedMealIds = recentPlans.flatMap(p => p.meals.map(m => m.mealId?.toString())).filter(Boolean);
  const activeDislikes = (user.dislikedMeals || [])
    .filter(d => d.expiresAt > new Date())
    .map(d => d.mealId.toString());

  const excludeIds = [...new Set([...usedMealIds, ...activeDislikes])];

  const query = {
    _id: { $nin: excludeIds },
    cost_ghs: { $lte: user.budget_per_day_ghs || 150 },
    prep_time_min: { $lte: user.max_cook_time_min || 90 }
  };

  if (user.allergies && user.allergies.length > 0) {
    query.tags = { $nin: user.allergies };
  }

  let candidateMeals = await Meal.find(query).limit(40);
  if (candidateMeals.length < 5) candidateMeals = await Meal.find({}).limit(20);

  // 2. Send to Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const mealListStr = candidateMeals.map(m => 
    `ID: ${m._id}, Name: ${m.name}, Cals: ${m.calories}, Cost: ${m.cost_ghs}GHS, Time: ${m.prep_time_min}min, Tags: ${m.tags.join(',')}`
  ).join('\n');

  const prompt = `
    You are a nutritionist for Ghanaians. Pick exactly 3 different meals from the provided list for 1 day (Breakfast, Lunch, Dinner).
    User Profile:
    - Target Calories: ${targets.calories} kcal/day
    - Budget: ${user.budget_per_day_ghs} GHS/day
    Meal List: ${mealListStr}
    Return ONLY valid JSON:
    {
      "meals": [{"meal_id": "ID", "type": "Breakfast", "reason": "..."}, ...],
      "total_cal": 0, "total_cost_ghs": 0
    }
  `;

  let planData;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    planData = JSON.parse(text);
  } catch (err) {
    console.error('Gemini error, fallback used');
    const shuffled = candidateMeals.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    planData = {
      meals: [
        { meal_id: selected[0]?._id || "6630f9a2f1c2b3d4e5f60001", type: 'Breakfast', reason: 'Healthy start' },
        { meal_id: selected[1]?._id || "6630f9a2f1c2b3d4e5f60002", type: 'Lunch', reason: 'Energizing' },
        { meal_id: selected[2]?._id || "6630f9a2f1c2b3d4e5f60003", type: 'Dinner', reason: 'Light' }
      ],
      total_cal: selected.reduce((sum, m) => sum + (m?.calories || 0), 0),
      total_cost_ghs: selected.reduce((sum, m) => sum + (m?.cost_ghs || 0), 0)
    };
  }

  // 3. Build and save
  const mealsToSave = [];
  for (const item of planData.meals) {
    const meal = candidateMeals.find(m => m._id.toString() === item.meal_id.toString()) || await Meal.findById(item.meal_id);
    if (meal) {
      mealsToSave.push({
        mealId: meal._id,
        type: item.type,
        name: meal.name,
        calories: meal.calories,
        cost_ghs: meal.cost_ghs,
        prep_time_min: meal.prep_time_min,
        reason: item.reason,
        completed: false
      });
    }
  }

  const newPlan = new MealPlan({
    userId,
    date: today,
    meals: mealsToSave,
    total_cal: planData.total_cal,
    total_cost_ghs: planData.total_cost_ghs
  });

  await newPlan.save();
  const populated = await MealPlan.findById(newPlan._id).populate('meals.mealId');
  
  // Merge logs
  const logs = await require('../models/MealLog').find({ userId, date: today });
  const planObj = populated.toObject();
  planObj.meals = planObj.meals.map(m => {
    const mId = m.mealId?._id || m.mealId;
    const log = mId ? logs.find(l => l.mealId && l.mealId.toString() === mId.toString()) : null;
    return { ...m, eaten: log ? log.eaten : false, rating: log ? log.rating : 0 };
  });

  return planObj;
}

/**
 * GET /api/meals/today
 * Main endpoint for the dashboard to get or generate today's plan
 */
router.get('/today', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = getTodayDate();
    
    // 1. Check if a plan already exists for today
    let existingPlan = await MealPlan.findOne({ userId, date: today }).populate('meals.mealId');
    
    // If no plan, or plan is stale, generate new
    if (!existingPlan) {
      existingPlan = await generateDailyPlan(user);
    }

    const logs = await require('../models/MealLog').find({ userId, date: today });
    const planObj = existingPlan.toObject();
    planObj.meals = planObj.meals.map(m => {
      const mId = m.mealId?._id || m.mealId;
      const log = mId ? logs.find(l => l.mealId && l.mealId.toString() === mId.toString()) : null;
      return {
        ...m,
        eaten: log ? log.eaten : false,
        rating: log ? log.rating : 0
      };
    });

    // Add user budget to response
    planObj.userBudget = user.budget_per_day_ghs || 150;

    return res.json(planObj);
  } catch (err) {
    console.error("GET today error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/meals/feedback
 * Save user feedback and update dislikes
 */
router.post('/feedback', async (req, res) => {
  try {
    const { userId, mealId, rating, feedback } = req.body;
    
    const newFeedback = new MealFeedback({ userId, mealId, rating, feedback });
    await newFeedback.save();

    // If rating is low, add to dislikes for 14 days
    if (rating <= 2) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14);
      
      await User.findOneAndUpdate(
        { uid: userId },
        { 
          $push: { 
            dislikedMeals: { mealId, expiresAt } 
          } 
        }
      );
    }

    res.json({ message: 'Feedback saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/meals/today
 * Clear today's plan (for the "Swap" feature)
 */
router.delete('/today', async (req, res) => {
  try {
    const { userId } = req.query;
    const today = getTodayDate();
    await MealPlan.findOneAndDelete({ userId, date: today });
    res.json({ message: 'Today\'s plan cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/meals/history/:userId
 * Get past meal plans
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const User = require('../models/User');
    const user = await User.findOne({ uid: userId });
    if (!user) return res.json([]);

    const history = await MealPlan.find({ userId }).sort({ date: -1 }).populate('meals.mealId');
    const logs = await require('../models/MealLog').find({ userId });

    const mergedHistory = history.map(plan => {
      const planObj = plan.toObject();
      planObj.meals = planObj.meals.map(m => {
        const mId = m.mealId?._id || m.mealId;
        const log = mId ? logs.find(l => l.date === plan.date && l.mealId.toString() === mId.toString()) : null;
        return {
          ...m,
          eaten: log ? log.eaten : false,
          rating: log ? log.rating : 0
        };
      });
      return planObj;
    });

    res.json(mergedHistory);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/meals/swap-single
 * Replaces a single meal in today's plan
 */
router.post('/swap-single', async (req, res) => {
  try {
    const { userId, mealId, index } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const User = require('../models/User');
    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    const MealPlan = require('../models/MealPlan');
    let plan = await MealPlan.findOne({ userId, date: today }).populate('meals.mealId');
    if (!plan) return res.status(404).json({ message: 'No plan found for today' });

    // Use index if provided, otherwise fallback to finding by ID
    let mealIndex = (index !== undefined) ? index : plan.meals.findIndex(m => {
      const mId = m.mealId?._id || m.mealId;
      return mId && mId.toString() === mealId;
    });

    if (mealIndex === -1 || !plan.meals[mealIndex]) {
      return res.status(400).json({ message: 'Meal slot not found' });
    }

    const mealSlot = plan.meals[mealIndex];
    const mealType = mealSlot.type;

    // Generate a single replacement meal
    const { generateSingleMeal } = require('../utils/gemini');
    const newMealData = await generateSingleMeal(user, mealType, [mealId]);

    const Meal = require('../models/Meal');
    const newMeal = new Meal(newMealData);
    await newMeal.save();

    // Update the plan
    plan.meals[mealIndex] = {
      mealId: newMeal._id,
      type: mealType,
      eaten: false,
      rating: 0,
      name: newMeal.name,
      calories: newMeal.calories,
      protein: newMeal.protein,
      carbs: newMeal.carbs,
      fat: newMeal.fat,
      prep_time_min: newMeal.prep_time_min,
      cost_ghs: newMeal.cost_ghs,
      reason: newMeal.reason
    };

    plan.markModified('meals');
    await plan.save();
    const updatedPlan = await MealPlan.findById(plan._id).populate('meals.mealId');
    res.json(updatedPlan);

  } catch (err) {
    console.error("Single swap error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/meals/grocery/week
 * Aggregates all ingredients for the current week's plans
 */
router.get('/grocery/week', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const plans = await MealPlan.find({
      userId,
      createdAt: { $gte: sevenDaysAgo }
    }).populate('meals.mealId');

    if (!plans || plans.length === 0) {
      return res.json({ items_by_category: {}, total_cost_ghs: 0, meals_included: 0 });
    }

    const ingredientMap = {};
    let totalCost = 0;

    plans.forEach(plan => {
      plan.meals.forEach(mealItem => {
        const meal = mealItem.mealId;
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ing => {
            const key = `${ing.name.toLowerCase()}-${ing.unit.toLowerCase()}`;
            if (!ingredientMap[key]) {
              ingredientMap[key] = {
                name: ing.name,
                qty: 0,
                unit: ing.unit,
                cost_ghs: 0,
                category: categorizeIngredient(ing.name)
              };
            }
            ingredientMap[key].qty += ing.qty;
            ingredientMap[key].cost_ghs += ing.cost_ghs;
            totalCost += ing.cost_ghs;
          });
        }
      });
    });

    // Group by category
    const items_by_category = {};
    Object.values(ingredientMap).forEach(item => {
      if (!items_by_category[item.category]) {
        items_by_category[item.category] = [];
      }
      items_by_category[item.category].push(item);
    });

    res.json({
      items_by_category,
      total_cost_ghs: Math.round(totalCost * 100) / 100,
      meals_included: plans.length * 3 // Approx 3 meals per plan
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/meals/recipe/:id
 */
router.get('/recipe/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Recipe not found' });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper to categorize ingredients
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

/**
 * GET /api/meals/feedback-status
 * Analyze recent ratings to show feedback nudge
 */
router.get('/feedback-status', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFeedbacks = await MealFeedback.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).populate('mealId');

    const ratedCount = recentFeedbacks.length;
    const highRatings = recentFeedbacks.filter(f => f.rating >= 4);
    const hasHighRating = highRatings.length > 0;

    // Extract tags from high ratings
    const tagCounts = {};
    highRatings.forEach(f => {
      if (f.mealId && f.mealId.tags) {
        f.mealId.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Get top 2 tags
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(t => t[0]);

    res.json({
      rated_count: ratedCount,
      has_high_rating: hasHighRating,
      last_rating_tags: sortedTags
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/meals/plan/add
 * Adds a specific meal to today's plan
 */
router.post('/plan/add', async (req, res) => {
  try {
    const { userId, mealId, type } = req.body;
    const today = getTodayDate();
    
    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });

    let plan = await MealPlan.findOne({ userId, date: today });
    
    const mealEntry = {
      mealId: meal._id,
      type: type || 'Extra',
      name: meal.name,
      calories: meal.calories,
      cost_ghs: meal.cost_ghs,
      prep_time_min: meal.prep_time_min,
      reason: 'Manually added',
      completed: false
    };

    if (plan) {
      plan.meals.push(mealEntry);
      plan.total_cal += meal.calories;
      plan.total_cost_ghs += meal.cost_ghs;
      await plan.save();
    } else {
      plan = new MealPlan({
        userId,
        date: today,
        meals: [mealEntry],
        total_cal: meal.calories,
        total_cost_ghs: meal.cost_ghs
      });
      await plan.save();
    }

    res.json(plan);
  } catch (err) {
    console.error("Plan Add Error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /api/meals/log
 * Logs a meal as eaten
 */
router.post('/log', async (req, res) => {
  try {
    const { userId, mealId, date, eaten, rating } = req.body;
    const MealLog = require('../models/MealLog');

    if (!eaten) {
      await MealLog.findOneAndDelete({ userId, mealId, date });
      return res.json({ message: 'Log removed' });
    }

    const log = await MealLog.findOneAndUpdate(
      { userId, mealId, date },
      { eaten, rating, logged_at: new Date() },
      { upsert: true, new: true }
    );

    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/meals/refresh
 * Forces regeneration of today's plan
 */
router.post('/refresh', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const user = await User.findOne({ uid: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = getTodayDate();
    await MealPlan.findOneAndDelete({ userId, date: today });

    const newPlan = await generateDailyPlan(user);
    res.json(newPlan);
  } catch (err) {
    console.error("Refresh Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
