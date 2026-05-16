const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Meal = require('./models/Meal');

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  // 1. Reset all to 'Any' first to start clean
  await Meal.updateMany({}, { $set: { type: 'Any' } });

  // 2. Breakfast categorization (Ghanaian specific)
  const breakfastRegex = /Koko|Porridge|Oat|Egg|Pancake|Fruit|Cereal|Milo|Tea|Bread|Toast|Omelette|Tom Brown|Oblayo|Ekuegbemi|Koose|Akara/i;
  await Meal.updateMany({ name: breakfastRegex }, { $set: { type: 'Breakfast' } });

  // 3. Lunch categorization (Heavier meals)
  const lunchRegex = /Jollof|Fufu|Banku|Kenkey|Waakye|Rice|Yam|Gari|Red Red|Beans|Tuo Zaafi|Kelewele|Eba|Tz|Placali/i;
  await Meal.updateMany({ name: lunchRegex }, { $set: { type: 'Lunch' } });

  // 4. Dinner categorization (Lighter or flexible)
  const dinnerRegex = /Light Soup|Salad|Grilled|Soup|Stew|Boiled Yam|Boiled Plantain/i;
  // Only set to dinner if it's still 'Any' (don't overwrite specialized breakfast/lunch)
  await Meal.updateMany({ name: dinnerRegex, type: 'Any' }, { $set: { type: 'Dinner' } });

  // 5. Check "Hausa Koko" specifically
  await Meal.updateMany({ name: /Hausa Koko/i }, { $set: { type: 'Breakfast' } });

  const finalTypes = await Meal.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
  console.log('Final Types Distribution:', finalTypes);
  
  process.exit(0);
}

migrate();
