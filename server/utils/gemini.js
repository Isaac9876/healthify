const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateMealPlan = async (userProfile) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const flags = (userProfile.dietaryPreferences || []).map(p => p.toLowerCase());
  const isVegetarian = flags.includes('vegetarian') || flags.includes('veggie');
  const isVegan = flags.includes('vegan');
  const isLowCarb = flags.includes('low carb') || flags.includes('low-carb');
  const calorieTarget = userProfile.calorieGoal && Number(userProfile.calorieGoal) > 0 ? Number(userProfile.calorieGoal) : null;
  const prefText = (userProfile.dietaryPreferences || []).join(', ');

  const prompt = `
    Generate a one-day meal plan for a ${userProfile.age} year old person living in Ghana.
    Dietary Preferences: ${prefText}.
    Health Goals: ${userProfile.healthGoals}.
    Constraints:
    ${isVegan ? '- Strictly vegan (no animal products)\n' : ''}
    ${isVegetarian && !isVegan ? '- Vegetarian (no meat/fish)\n' : ''}
    ${isLowCarb ? '- Keep meals relatively low in refined carbs\n' : ''}
    ${calorieTarget ? `- Aim for total daily calories around ${calorieTarget} kcal (+/- 10%)\n` : ''}
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
    return {
      meals: [
        {
          type: "Breakfast",
          name: "Oat porridge with banana and peanuts",
          description: "Warm oats topped with sliced banana and a sprinkle of groundnuts",
          calories: 350
        },
        {
          type: "Lunch",
          name: "Grilled chicken with jollof rice and side salad",
          description: "Lean grilled chicken breast served with portion-controlled jollof rice and vegetables",
          calories: 600
        },
        {
          type: "Dinner",
          name: "Kontomire stew with boiled plantain",
          description: "Light spinach-based stew (kontomire) with boiled ripe plantain",
          calories: 450
        },
        {
          type: "Snack",
          name: "Watermelon slices and roasted groundnuts",
          description: "Hydrating fruit with a handful of protein-rich groundnuts",
          calories: 180
        }
      ]
    };
  }
};

module.exports = { generateMealPlan };
