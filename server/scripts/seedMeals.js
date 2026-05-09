const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Meal = require('../models/Meal');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Clear existing meals
    await Meal.deleteMany({});
    console.log('Cleared existing meals.');

    const meals = [];

    fs.createReadStream(path.join(__dirname, '../meals_seed.csv'))
      .pipe(csv())
      .on('data', (row) => {
        try {
          const meal = {
            name: row.name,
            cuisine: row.cuisine,
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
            calories: Number(row.calories) || 0,
            protein_g: Number(row.protein_g) || 0,
            carbs_g: Number(row.carbs_g) || 0,
            fat_g: Number(row.fat_g) || 0,
            prep_time_min: Number(row.prep_time_min) || 0,
            cost_ghs: Number(row.cost_ghs) || 0,
            ingredients: JSON.parse(row.ingredients || '[]'),
            instructions: row.instructions,
            image_url: row.image_url
          };
          meals.push(meal);
        } catch (err) {
          console.error(`Error parsing row ${row.name}:`, err.message);
        }
      })
      .on('end', async () => {
        try {
          if (meals.length > 0) {
            await Meal.insertMany(meals);
            console.log(`Successfully seeded ${meals.length} meals.`);
          } else {
            console.log('No meals found to seed.');
          }
          process.exit(0);
        } catch (err) {
          console.error('Error inserting meals:', err.message);
          process.exit(1);
        }
      });
  } catch (err) {
    console.error('Connection error:', err.message);
    process.exit(1);
  }
}

seed();
