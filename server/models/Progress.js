const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  weight: {
    type: Number, // in kg
  },
  waterIntake: {
    type: Number, // in glasses or liters
  },
  mealsCompleted: {
    type: Number,
    default: 0,
  },
  mood: {
    type: String, // e.g., "Energetic", "Tired"
  }
});

// Compound index to ensure one entry per day per user
ProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
