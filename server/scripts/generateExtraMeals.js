const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const csvPath = path.join(__dirname, '../meals_seed.csv');

async function generateBatch(existingMealNames, count, category) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const prompt = `
    Generate ${count} healthy meal records for a health app based in Ghana.
    Category: ${category}
    
    Existing meals (DO NOT DUPLICATE THESE):
    ${existingMealNames.join(', ')}
    
    Format: CSV (no header, just rows)
    Fields: name,cuisine,tags,calories,protein_g,carbs_g,fat_g,prep_time_min,cost_ghs,ingredients,instructions,image_url
    
    Requirements:
    - cuisine: "Ghanaian", "West African", or "International".
    - tags: comma-separated list including things like "high-protein", "vegetarian", "cheap", "quick", "traditional".
    - calories/macros: realistic estimates.
    - cost_ghs: realistic Accra market prices as of May 2026.
    - ingredients: valid JSON array of objects like [{"name":"...", "qty":0, "unit":"...", "cost_ghs":0}].
    - instructions: brief 2-3 step summary.
    - image_url: follow pattern "/images/filename.jpg".
    
    Return ONLY the CSV rows. No markdown blocks.
  `;

  let retries = 3;
  while (retries > 0) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().replace(/```csv/g, '').replace(/```/g, '').trim();
    } catch (err) {
      console.log(`Error in batch generation: ${err.message}. Retrying... (${retries} left)`);
      retries--;
      if (retries === 0) throw err;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function run() {
  try {
    console.log('Generating additional meals to reach 150...');
    
    // Read existing to avoid duplicates
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    const existingNames = lines.slice(1).map(l => l.split(',')[0]).filter(Boolean);
    
    console.log(`Currently have ${existingNames.length} meals.`);
    const remainingNeeded = 150 - existingNames.length;
    
    if (remainingNeeded <= 0) {
      console.log('Already have 150 or more meals.');
      return;
    }

    console.log(`Generating ${remainingNeeded} more meals...`);
    
    // Smaller batches to avoid timeouts
    const batchSize = 15;
    let allNewRows = '';
    
    for (let i = 0; i < remainingNeeded; i += batchSize) {
      const currentBatchCount = Math.min(batchSize, remainingNeeded - i);
      console.log(`Generating batch of ${currentBatchCount}...`);
      
      // Send only a subset of existing names to keep prompt small
      const recentExisting = existingNames.slice(-20); 
      
      // Alternate between Ghanaian and International for variety
      const cat = (i % 30 < 15) ? "Authentic Ghanaian/West African" : "Healthy International/Fusion";
      const rows = await generateBatch(recentExisting, currentBatchCount, cat);
      
      allNewRows += '\n' + rows;
      
      // Add a longer delay
      console.log('Batch complete. Waiting 5s...');
      await new Promise(r => setTimeout(r, 5000));
    }

    fs.appendFileSync(csvPath, allNewRows);
    console.log('Successfully appended new meals to meals_seed.csv');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
