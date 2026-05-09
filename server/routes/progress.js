const express = require('express');
const router = express.Router();
const MealPlan = require('../models/MealPlan');
const MealLog = require('../models/MealLog');
const Meal = require('../models/Meal');

/**
 * GET /api/progress/week
 * Returns weekly adherence and nutritional summary
 */
router.get('/week', async (req, res) => {
  try {
    const { userId, date } = req.query; // Expects YYYY-MM-DD
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const User = require('../models/User');
    const user = await User.findOne({ uid: userId });
    
    // If no profile exists, return zeros immediately
    if (!user) {
      return res.json({
        week_start: date || new Date().toISOString().split('T')[0],
        days: [],
        summary: {
          days_eaten: 0,
          total_planned: 0,
          adherence_avg: 0,
          total_budget_saved_ghs: 0,
          avg_protein_g: 0
        }
      });
    }

    // Calculate week window (Monday to Sunday)
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

    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    // Fetch all plans and logs for the week
    const plans = await MealPlan.find({
      userId,
      date: { $in: weekDays }
    }).populate('meals.mealId');

    const logs = await MealLog.find({
      userId,
      date: { $in: weekDays }
    }).populate('mealId');

    // Aggregate data per day
    let totalEaten = 0;
    let totalPlanned = 0;
    let totalSavedGHS = 0;
    let totalProtein = 0;

    const days = weekDays.map(d => {
      const dayPlan = plans.find(p => p.date === d);
      const dayLogs = logs.filter(l => l.date === d && l.eaten);
      
      const plannedMeals = dayPlan ? dayPlan.meals : [];
      const loggedMeals = dayLogs.map(l => l.mealId).filter(Boolean);
      
      const adherence = plannedMeals.length > 0 
        ? Math.round((dayLogs.length / plannedMeals.length) * 100) 
        : 0;

      totalEaten += dayLogs.length;
      totalPlanned += plannedMeals.length;
      
      // Calculate savings and protein from logs
      dayLogs.forEach(log => {
        if (log.mealId) {
          totalSavedGHS += (log.mealId.cost_ghs || 0);
          totalProtein += (log.mealId.protein || 0);
        }
      });

      return {
        date: d,
        planned_count: plannedMeals.length,
        logged_count: dayLogs.length,
        adherence_pct: adherence,
        planned_meals: plannedMeals,
        logged_meals: loggedMeals
      };
    });

    res.json({
      week_start: weekStart,
      days,
      summary: {
        days_eaten: totalEaten,
        total_planned: totalPlanned,
        adherence_avg: totalPlanned > 0 ? Math.round((totalEaten / totalPlanned) * 100) : 0,
        total_budget_saved_ghs: Math.round(totalSavedGHS * 100) / 100,
        avg_protein_g: totalEaten > 0 ? Math.round(totalProtein / totalEaten) : 0
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/progress
 * Upsert daily progress entry
 */
router.post('/', async (req, res) => {
  try {
    const { uid, date, weight, waterIntake, mood } = req.body;
    const Progress = require('../models/Progress');

    const progress = await Progress.findOneAndUpdate(
      { userId: uid, date },
      { weight, waterIntake, mood },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/progress/:userId
 * Get progress history for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const Progress = require('../models/Progress');
    const history = await Progress.find({ userId: req.params.userId })
      .sort({ date: 1 })
      .limit(30);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
