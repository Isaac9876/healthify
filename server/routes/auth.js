const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Create or Update User Profile
// POST /api/auth/profile
router.post('/profile', async (req, res) => {
  const { uid, email, name, age, dietaryPreferences, healthGoals, calorieGoal, hydrationTarget } = req.body;

  try {
    const rs = mongoose.connection.readyState;
    if (rs === 0) {
      return res.status(503).json({ msg: 'Database not connected' });
    }

    const normalizedAge = age !== undefined && age !== null ? Number(age) : undefined;
    if (normalizedAge !== undefined && (!Number.isFinite(normalizedAge) || normalizedAge <= 0)) {
      return res.status(400).json({ msg: 'Invalid age' });
    }
    const preferences = Array.isArray(dietaryPreferences) ? dietaryPreferences.filter(Boolean) : [];
    const normalizedCalorieGoal = calorieGoal !== undefined && calorieGoal !== null ? Number(calorieGoal) : undefined;
    const normalizedHydrationTarget = hydrationTarget !== undefined && hydrationTarget !== null ? Number(hydrationTarget) : undefined;

    let user = await User.findOne({ uid });

    if (user) {
      user.age = normalizedAge;
      user.dietaryPreferences = preferences;
      user.healthGoals = healthGoals;
      user.name = name;
      if (normalizedCalorieGoal !== undefined) user.calorieGoal = normalizedCalorieGoal;
      if (normalizedHydrationTarget !== undefined) user.hydrationTarget = normalizedHydrationTarget;
    } else {
      user = new User({
        uid,
        email,
        name,
        age: normalizedAge,
        dietaryPreferences: preferences,
        healthGoals,
        calorieGoal: normalizedCalorieGoal,
        hydrationTarget: normalizedHydrationTarget
      });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Get User Profile
// GET /api/auth/profile/:uid
router.get('/profile/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
