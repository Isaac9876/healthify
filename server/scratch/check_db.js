const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mealSchema = new mongoose.Schema({
  name: String,
  type: String,
  cost_ghs: Number,
  tags: [String]
});

const Meal = mongoose.model('Meal', mealSchema);

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await Meal.countDocuments();
  const sample = await Meal.findOne();
  console.log('Total Meals:', count);
  console.log('Sample Meal:', sample);
  
  const types = await Meal.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  console.log('Types:', types);
  
  process.exit(0);
}

check();
