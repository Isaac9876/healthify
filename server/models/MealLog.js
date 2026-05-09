const mongoose = require('mongoose');

const MealLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  mealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  eaten: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  logged_at: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to quickly find logs for a user on a specific day
MealLogSchema.index({ userId: 1, date: 1, mealId: 1 }, { unique: true });

module.exports = mongoose.model('MealLog', MealLogSchema);
