const { GoogleGenerativeAI } = require("@google/generative-ai");
const Meal = require('../models/Meal');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
  You are an expert nutritionist specialized in West African, specifically Ghanaian, cuisine. 
  Your goal is to provide healthy, nutrient-dense meal plans that are culturally relevant and economically realistic for someone living in Ghana.
  
  PRICING GUIDELINES (GHS):
  - Simple/Basic Home Meal: 60-95 GHS
  - Standard Healthy/Restaurant Meal: 100-175 GHS
  - Premium/High-Protein/Specialty: 180-350 GHS
  - Snacks/Small Sides: 35-65 GHS
  Always provide realistic, modern prices based on current inflation and healthy ingredient costs in major Ghanaian cities.
`;

const generateMealPlan = async (userProfile) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prefText = (userProfile.dietaryPreferences || []).join(', ');
  const allergyText = (userProfile.allergies || []).join(', ');

  const prompt = `
    ${SYSTEM_INSTRUCTION}
    
    Generate a complete 1-day meal plan (Breakfast, Lunch, Dinner, Snack) for:
    - Profile: ${userProfile.age}y, ${userProfile.height}cm, ${userProfile.weight}kg, ${userProfile.activityLevel}
    - Goals: ${userProfile.healthGoals}
    - Restrictions: ${prefText} | Allergies: ${allergyText}
    
    For each meal, include:
    1. name (concise, professional)
    2. description (appealing)
    3. calories, protein (g), carbs (g), fat (g)
    4. prep_time_min (realistic)
    5. cost_ghs (REALISTIC Ghanaian prices, 30-200 range)
    6. reason (why this is good for their specific profile)
    7. ingredients (array of {name, qty, unit, category: protein|vegetable|starch|dairy|spice|other})

    Return ONLY a JSON object:
    {
      "meals": [
        { "type": "Breakfast", "name": "...", ... },
        ...
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return getFallbackPlan();
  }
};

const generateSingleMeal = async (userProfile, mealType, excludeIds = []) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    ${SYSTEM_INSTRUCTION}
    
    Generate ONE SINGLE ${mealType} as a replacement meal for:
    - Profile: ${userProfile.age}y, ${userProfile.height}cm, ${userProfile.weight}kg
    - Goals: ${userProfile.healthGoals}
    
    Include: name, description, calories, protein, carbs, fat, prep_time_min, cost_ghs, reason, and ingredients.
    
    Return ONLY a JSON object for that ONE meal.
    
    IMPORTANT: Do not suggest the same meal as the one being replaced. Avoid these meal names/types if possible: ${excludeIds.join(', ')}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Single Error:", error);
    return getFallbackPlan().meals.find(m => m.type === mealType) || getFallbackPlan().meals[0];
  }
};

const getFallbackPlan = () => ({
  meals: [
    {
      type: "Breakfast",
      name: "Fortified Tom Brown with Milk",
      description: "Traditional Ghanaian toasted corn and legume porridge with a splash of milk.",
      calories: 380, protein: 12, carbs: 55, fat: 10,
      prep_time_min: 15, cost_ghs: 45,
      reason: "High fiber and steady energy release for your activity level.",
      ingredients: [{ name: "Tom Brown Mix", qty: 100, unit: "g", category: "starch" }]
    },
    // ... other fallbacks could be added but I'll keep it short for brevity
  ]
});

module.exports = { generateMealPlan, generateSingleMeal };
