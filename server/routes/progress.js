const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const MealLog = require('../models/MealLog');
const Meal = require('../models/Meal');
const User = require('../models/User');

router.get('/week', async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const user = await User.findOne({ uid: userId });
    if (!user) {
      return res.json({
        week_start: date || new Date().toISOString().split('T')[0],
        days: [],
        summary: { days_active: 0, total_meals_eaten: 0, adherence_avg: 0, total_budget_saved_ghs: 0, avg_protein_g: 0 }
      });
    }

    // Week calculation (Mon-Sun)
    const anchorDate = new Date(date || new Date());
    const day = anchorDate.getDay();
    const diff = anchorDate.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(anchorDate.setDate(diff));
    start.setHours(0,0,0,0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      weekDays.push(d.toISOString().split('T')[0]);
    }

    const plans = await MealPlan.find({ userId, date: { $in: weekDays } }).populate('meals.mealId');
    const logs = await MealLog.find({ userId, date: { $in: weekDays } }).populate('mealId');

    let totalMealsEaten = 0;
    let totalPlanned = 0;
    let totalSavedGHS = 0;
    let totalProtein = 0;
    let daysActive = 0;

    const days = weekDays.map(d => {
      const dayPlan = plans.find(p => p.date === d);
      const dayLogs = logs.filter(l => l.date === d && l.eaten);
      
      const plannedMeals = dayPlan ? dayPlan.meals : [];
      const loggedCount = dayLogs.length;

      if (loggedCount > 0) daysActive++;
      
      totalMealsEaten += loggedCount;
      totalPlanned += plannedMeals.length;
      
      dayLogs.forEach(log => {
        if (log.mealId) {
          totalSavedGHS += (log.mealId.cost_ghs || 0);
          totalProtein += (log.mealId.protein_g || 0); // Corrected to protein_g
        }
      });

      return {
        date: d,
        planned_count: plannedMeals.length,
        logged_count: loggedCount,
        adherence_pct: plannedMeals.length > 0 ? Math.round((loggedCount / plannedMeals.length) * 100) : 0
      };
    });

    res.json({
      week_start: weekDays[0],
      days,
      summary: {
        days_active: daysActive,
        total_meals_eaten: totalMealsEaten,
        adherence_avg: totalPlanned > 0 ? Math.round((totalMealsEaten / totalPlanned) * 100) : 0,
        total_budget_saved_ghs: Math.round(totalSavedGHS * 100) / 100,
        avg_protein_g: totalMealsEaten > 0 ? Math.round(totalProtein / totalMealsEaten) : 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
