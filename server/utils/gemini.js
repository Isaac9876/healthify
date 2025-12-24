const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateMealPlan = async (userProfile) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Generate a one-day meal plan for a ${userProfile.age} year old person living in Ghana.
    Dietary Preferences: ${userProfile.dietaryPreferences.join(', ')}.
    Health Goals: ${userProfile.healthGoals}.
    
    Include Breakfast, Lunch, Dinner, and a Snack.
    Focus on Ghanaian dishes where appropriate but keep it healthy.
    Estimate calories for each meal.
    
    Return ONLY a valid JSON object with the following structure (no markdown formatting):
    {
      "meals": [
        {
          "type": "Breakfast",
          "name": "Meal Name",
          "description": "Short description",
          "calories": 300
        },
        {
          "type": "Lunch",
          "name": "Meal Name",
          "description": "Short description",
          "calories": 500
        },
        {
          "type": "Dinner",
          "name": "Meal Name",
          "description": "Short description",
          "calories": 400
        },
        {
          "type": "Snack",
          "name": "Meal Name",
          "description": "Short description",
          "calories": 150
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if present (Gemini sometimes adds ```json ... ```)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Failed to generate meal plan");
  }
};

module.exports = { generateMealPlan };
