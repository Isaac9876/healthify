const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const Progress = require('../models/Progress');
const { generateMealPlan } = require('../utils/gemini');

// Generate a new meal plan
// POST /api/meals/generate
router.post('/generate', async (req, res) => {
  const { uid, age, dietaryPreferences, healthGoals } = req.body;

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if plan exists for today
    let existingPlan = await MealPlan.findOne({ userId: uid, date: today });
    if (existingPlan) {
      return res.json(existingPlan);
    }

    // Generate plan using Gemini
    const generatedData = await generateMealPlan({ age, dietaryPreferences, healthGoals });

    // Save to Database
    const newMealPlan = new MealPlan({
      userId: uid, 
      date: today,
      meals: generatedData.meals
    });

    const savedPlan = await newMealPlan.save();

    res.json(savedPlan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's meal plans
// GET /api/meals/:uid
router.get('/:uid', async (req, res) => {
  try {
    const meals = await MealPlan.find({ userId: req.params.uid }).sort({ date: -1 });
    res.json(meals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Toggle meal completion
// PUT /api/meals/:planId/toggle/:mealIndex
router.put('/:planId/toggle/:mealIndex', async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.planId);
    if (!mealPlan) {
      return res.status(404).json({ msg: 'Meal plan not found' });
    }

    const mealIndex = parseInt(req.params.mealIndex);
    if (mealIndex < 0 || mealIndex >= mealPlan.meals.length) {
      return res.status(400).json({ msg: 'Invalid meal index' });
    }

    const meal = mealPlan.meals[mealIndex];
    const oldStatus = meal.completed;
    const newStatus = !oldStatus;
    
    // Toggle status
    meal.completed = newStatus;
    await mealPlan.save();

    // Update Progress
    const calories = meal.calories || 0;
    if (calories > 0) {
      const today = mealPlan.date; // Use meal plan date
      let progress = await Progress.findOne({ userId: mealPlan.userId, date: today });
      
      if (!progress) {
        progress = new Progress({
          userId: mealPlan.userId,
          date: today,
          caloriesConsumed: 0
        });
      }

      if (newStatus) {
        progress.caloriesConsumed = (progress.caloriesConsumed || 0) + calories;
      } else {
        progress.caloriesConsumed = Math.max(0, (progress.caloriesConsumed || 0) - calories);
      }
      
      await progress.save();
    }
    
    res.json(mealPlan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
