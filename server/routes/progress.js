const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Add or Update Progress for a specific date
// POST /api/progress
router.post('/', async (req, res) => {
  const { uid, date, weight, waterIntake, caloriesConsumed, mood } = req.body;

  try {
    let progress = await Progress.findOne({ userId: uid, date });

    if (progress) {
      // Update existing
      if (weight) progress.weight = weight;
      if (waterIntake) progress.waterIntake = waterIntake;
      if (caloriesConsumed) progress.caloriesConsumed = caloriesConsumed;
      if (mood) progress.mood = mood;
    } else {
      // Create new
      progress = new Progress({
        userId: uid,
        date,
        weight,
        waterIntake,
        caloriesConsumed,
        mood
      });
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get Progress History for a user
// GET /api/progress/:uid
router.get('/:uid', async (req, res) => {
  try {
    const history = await Progress.find({ userId: req.params.uid }).sort({ date: 1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
