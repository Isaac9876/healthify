import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUtensils, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { FaFire, FaListOl } from 'react-icons/fa';
import Landing from './Landing';

const Home = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [todayProgress, setTodayProgress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profileRes = await api.get(`/auth/profile/${currentUser.uid}`);
          setUserProfile(profileRes.data);

          const mealsRes = await api.get(`/meals/${currentUser.uid}`);
          const progressRes = await api.get(`/progress/${currentUser.uid}`);
          const today = new Date().toISOString().split('T')[0];
          let todayPlan = null;
          let todayProg = null;

          if (mealsRes.data && mealsRes.data.length > 0) {
            const latest = mealsRes.data[0];
            if (latest.date === today) {
              todayPlan = latest;
              setMealPlan(latest);
            }
          }
          if (Array.isArray(progressRes.data)) {
            todayProg = progressRes.data.find(p => p.date === today) || null;
            setTodayProgress(todayProg);
          }

          // Auto-generate if no plan exists and profile is complete
          if (!todayPlan && profileRes.data && profileRes.data.age && profileRes.data.healthGoals) {
            setGenerating(true);
            try {
              const genRes = await api.post('/meals/generate', {
                uid: currentUser.uid,
                age: profileRes.data.age,
                dietaryPreferences: profileRes.data.dietaryPreferences,
                healthGoals: profileRes.data.healthGoals
              });
              setMealPlan(genRes.data);
            } catch (err) {
              console.error("Auto-generation failed:", err);
            }
            setGenerating(false);
          }

        } catch (err) {
          console.error("Error fetching data:", err);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const generateMealPlan = async () => {
    if (!user) {
        navigate('/login');
        return;
    }
    if (!userProfile || !userProfile.age || !userProfile.healthGoals) {
      alert("Please complete your profile first!");
      navigate('/profile');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/meals/generate', {
        uid: user.uid,
        age: userProfile.age,
        dietaryPreferences: userProfile.dietaryPreferences,
        healthGoals: userProfile.healthGoals
      });
      setMealPlan(res.data);
    } catch (err) {
      console.error("Error generating meal plan:", err);
      alert("Failed to generate meal plan. Please try again.");
    }
    setGenerating(false);
  };

  const toggleMeal = async (index) => {
    if (!mealPlan) return;
    
    // Optimistic update
    const newMeals = [...mealPlan.meals];
    newMeals[index].completed = !newMeals[index].completed;
    setMealPlan({ ...mealPlan, meals: newMeals });

    try {
      await api.put(`/meals/${mealPlan._id}/toggle/${index}`);
      // Refresh today's progress summary
      const progressRes = await api.get(`/progress/${user.uid}`);
      const today = new Date().toISOString().split('T')[0];
      const todayProg = Array.isArray(progressRes.data) ? progressRes.data.find(p => p.date === today) : null;
      setTodayProgress(todayProg || null);
    } catch (err) {
      console.error("Error toggling meal:", err);
      // Revert on error
      newMeals[index].completed = !newMeals[index].completed;
      setMealPlan({ ...mealPlan, meals: newMeals });
      alert("Failed to update meal status");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-16 px-4 text-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1543362906-ac1b96633e36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')", backgroundSize: 'cover', backgroundBlendMode: 'overlay'}}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Welcome back, {user?.displayName}!
        </motion.h1>
        <p className="text-xl md:text-2xl mb-8">Your journey to a healthier you starts with a single meal.</p>
        
        {userProfile && (!userProfile.age || !userProfile.healthGoals) && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 max-w-2xl mx-auto text-left rounded shadow-md"
             role="alert"
           >
             <div className="flex items-center justify-between">
               <div>
                 <p className="font-bold">Profile Incomplete</p>
                 <p>Please complete your health profile to get personalized meal plans.</p>
               </div>
               <Link to="/profile" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition">
                 Complete Profile
               </Link>
             </div>
           </motion.div>
        )}

        {!mealPlan && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateMealPlan}
            disabled={generating}
            className="bg-white text-green-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
          >
            {generating ? 'Crafting your menu...' : 'Generate Today\'s Meal Plan'}
          </motion.button>
        )}
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Summary Cards */}
        {todayProgress && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FaFire className="text-red-500 text-3xl" />
              <div>
                <p className="text-sm text-gray-500">Calories Consumed</p>
                <p className="text-2xl font-bold text-gray-800">{todayProgress.caloriesConsumed || 0} kcal</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
              <FaListOl className="text-blue-600 text-3xl" />
              <div>
                <p className="text-sm text-gray-500">Meals Completed</p>
                <p className="text-2xl font-bold text-gray-800">{todayProgress.mealsCompleted || 0} / 4</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-sm text-gray-500 mb-2">Daily Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((todayProgress.mealsCompleted || 0)/4)*100)}%` }}
                  className="h-3 bg-green-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        {userProfile && userProfile.calorieGoal > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow p-6 mb-10"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">Calorie Goal</p>
              <p className="text-sm text-gray-700">{todayProgress?.caloriesConsumed || 0} / {userProfile.calorieGoal} kcal</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((todayProgress?.caloriesConsumed || 0)/userProfile.calorieGoal)*100)}%` }}
                className="h-4 bg-red-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
        {mealPlan ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Your Daily Fuel</h2>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-1 rounded-full">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mealPlan.meals.map((meal, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-gray-100"
                >
                  <div 
                    className={`p-4 ${meal.type === 'Breakfast' ? 'bg-orange-100' : meal.type === 'Lunch' ? 'bg-green-100' : meal.type === 'Dinner' ? 'bg-blue-100' : 'bg-purple-100'}`}
                    style={{
                      backgroundImage: `url(${
                        meal.type === 'Breakfast' 
                          ? 'https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=1200&auto=format&fit=crop'
                          : meal.type === 'Lunch' 
                          ? 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1200&auto=format&fit=crop'
                          : meal.type === 'Dinner' 
                          ? 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200&auto=format&fit=crop'
                          : 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=1200&auto=format&fit=crop'
                      })`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundBlendMode: 'overlay'
                    }}
                  >
                    <h3 className="font-bold text-lg text-gray-800 flex items-center">
                      <FaUtensils className="mr-2 opacity-75" />
                      {meal.type}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-xl text-gray-800">{meal.name}</h4>
                      {meal.calories && (
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          {meal.calories} kcal
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{meal.description}</p>
                    <div className="flex justify-end items-center gap-2">
                      <span className={`text-sm font-medium ${meal.completed ? 'text-green-600' : 'text-gray-400'}`}>
                        {meal.completed ? 'Completed' : 'Mark as Done'}
                      </span>
                      <button 
                        onClick={() => toggleMeal(index)}
                        className={`transition duration-300 transform active:scale-90 ${meal.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}
                      >
                        <FaCheckCircle size={28} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <FaExclamationCircle className="mx-auto text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 text-xl">No meal plan generated for today yet.</p>
            <p className="text-gray-400">Click the button above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
