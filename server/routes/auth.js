const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or Update User Profile
// POST /api/auth/profile
router.post('/profile', async (req, res) => {
  const { uid, email, name, age, dietaryPreferences, healthGoals } = req.body;

  try {
    let user = await User.findOne({ uid });

    if (user) {
      // Update
      user.age = age;
      user.dietaryPreferences = dietaryPreferences;
      user.healthGoals = healthGoals;
      user.name = name;
      // email is usually constant but can be updated
    } else {
      // Create
      user = new User({
        uid,
        email,
        name,
        age,
        dietaryPreferences,
        healthGoals
      });
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
  }
});

module.exports = router;
