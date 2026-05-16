const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Extra', 'Any'],
    default: 'Any'
  },
  tags: [String],
  calories: {
    type: Number,
    required: true,
  },
  protein_g: Number,
  carbs_g: Number,
  fat_g: Number,
  prep_time_min: Number,
  cost_ghs: Number,
  ingredients: [
    {
      name: String,
      qty: Number,
      unit: String,
      cost_ghs: Number,
    }
  ],
  instructions: String,
  image_url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

MealSchema.index({ cost_ghs: 1, prep_time_min: 1 });
MealSchema.index({ tags: 1 });

module.exports = mongoose.model('Meal', MealSchema);
