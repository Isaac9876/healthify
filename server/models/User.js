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
  age: {
    type: Number,
  },
  dietaryPreferences: {
    type: [String],
    default: [],
  },
  healthGoals: {
    type: String,
  },
  calorieGoal: {
    type: Number,
    default: 0,
  },
  hydrationTarget: {
    type: Number, // glasses or liters depending on UI
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
