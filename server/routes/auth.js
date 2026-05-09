const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');

// Update User Profile
// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  const { 
    uid, name, gender, age, height, weight, targetWeight,
    activityLevel, healthGoals, budget_per_day_ghs, 
    max_cook_time_min, allergies, dietaryPreferences,
    hydrationTarget, profileImage, medicalConditions
  } = req.body;

  try {
    console.log("Updating profile for UID:", uid);
    if (!uid) return res.status(400).json({ msg: 'User ID is required' });

    let user = await User.findOne({ uid });
    if (!user) {
      console.log("User not found, creating new profile for UID:", uid);
      user = new User({ uid, email: req.body.email || "" }); // Initialize new user
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = Number(age);
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (targetWeight !== undefined) user.targetWeight = Number(targetWeight);
    if (activityLevel !== undefined) user.activityLevel = activityLevel;
    if (healthGoals !== undefined) user.healthGoals = healthGoals;
    if (budget_per_day_ghs !== undefined) user.budget_per_day_ghs = Number(budget_per_day_ghs);
    if (max_cook_time_min !== undefined) user.max_cook_time_min = Number(max_cook_time_min);
    
    if (allergies !== undefined) {
      user.allergies = Array.isArray(allergies) ? allergies : allergies.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (dietaryPreferences !== undefined) {
      user.dietaryPreferences = Array.isArray(dietaryPreferences) ? dietaryPreferences : dietaryPreferences.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    if (hydrationTarget !== undefined) user.hydrationTarget = Number(hydrationTarget);
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (medicalConditions !== undefined) user.medicalConditions = medicalConditions;

    console.log("Saving user...");
    await user.save();
    console.log("User saved successfully.");

    // Recalculate targets
    const { getTargets } = require('../utils/nutrition');
    const targets = getTargets(user);

    res.json({ user, targets });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
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

// Delete User Profile
// DELETE /api/auth/profile/:uid
router.delete('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    console.log(`Starting full deletion for UID: ${uid}`);

    const user = await User.findOneAndDelete({ uid });
    if (!user) {
      console.log(`User ${uid} not found in MongoDB, but continuing to clear potential orphaned data.`);
    }
    
    // Also delete user's meal plans and progress data
    const MealPlan = require('../models/MealPlan');
    const Progress = require('../models/Progress');
    const MealLog = require('../models/MealLog');
    const MealFeedback = require('../models/MealFeedback');
    
    const results = await Promise.all([
      MealPlan.deleteMany({ userId: uid }),
      Progress.deleteMany({ userId: uid }),
      MealLog.deleteMany({ userId: uid }),
      MealFeedback.deleteMany({ userId: uid })
    ]);

    console.log(`Deletion results for ${uid}:`, results.map(r => r.deletedCount));

    res.json({ msg: 'Profile and associated data deleted successfully' });
  } catch (err) {
    console.error(`Deletion error for ${req.params.uid}:`, err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
