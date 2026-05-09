const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  age: {
    type: Number,
  },
  dietaryPreferences: {
    type: [String],
    default: [],
  },
  budget_per_day_ghs: {
    type: Number,
    default: 100,
  },
  max_cook_time_min: {
    type: Number,
    default: 60,
  },
  dislikedMeals: [
    {
      mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
      expiresAt: { type: Date },
    }
  ],
  healthGoals: {
    type: String,
  },
  height: {
    type: Number, // in cm
  },
  weight: {
    type: Number, // in kg
  },
  targetWeight: {
    type: Number, // in kg
  },
  activityLevel: {
    type: String, // e.g., Sedentary, Active, Very Active
  },
  allergies: {
    type: [String],
    default: [],
  },
  medicalConditions: {
    type: String,
  },
  hydrationTarget: {
    type: Number, // glasses or liters depending on UI
    default: 8,
  },
  profileImage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
