/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 */
const calculateBMR = (weight, height, age, gender) => {
  if (gender === 'Male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on activity level
 */
const calculateTDEE = (bmr, activityLevel) => {
  const multipliers = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extra Active': 1.9
  };
  return bmr * (multipliers[activityLevel] || 1.2);
};

/**
 * Gets calorie and macro targets based on health goals
 */
const getTargets = (user) => {
  const { weight, height, age, gender, activityLevel, healthGoals } = user;
  
  // Fallback values if data is missing
  const bmr = calculateBMR(weight || 70, height || 170, age || 25, gender || 'Male');
  const tdee = calculateTDEE(bmr, activityLevel || 'Sedentary');
  
  let targetCalories = tdee;
  if (healthGoals === 'Weight Loss') targetCalories -= 500;
  if (healthGoals === 'Weight Gain') targetCalories += 500;
  
  // Basic macro split: 30% Protein, 40% Carbs, 30% Fat
  return {
    calories: Math.round(targetCalories),
    protein: Math.round((targetCalories * 0.3) / 4),
    carbs: Math.round((targetCalories * 0.4) / 4),
    fat: Math.round((targetCalories * 0.3) / 9)
  };
};

module.exports = { getTargets };
