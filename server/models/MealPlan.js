const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  meals: [
    {
      mealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true,
      },
      type: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Extra'],
        required: true,
      },
      name: String,
      calories: Number,
      cost_ghs: Number,
      prep_time_min: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      reason: String,
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  total_cal: Number,
  total_cost_ghs: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups by user and date
MealPlanSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('MealPlan', MealPlanSchema);
