import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, FaFire, FaClock, FaMoneyBillWave, 
  FaSyncAlt, FaChevronRight, FaStar, FaRegStar 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { auth } from '../firebase';
import { useQueryClient } from '@tanstack/react-query';

const MealCard = ({ meal, index, onSwap }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(meal.rating || 0);
  const [isEaten, setIsEaten] = useState(meal.eaten || false);
  const [loading, setLoading] = useState(false);

  const mealId = meal.mealId?._id || meal.mealId;

  const handleToggleEaten = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const newEaten = !isEaten;
      await api.post('/meals/log', {
        userId: auth.currentUser.uid,
        mealId: mealId,
        eaten: newEaten,
        date: new Date().toISOString().split('T')[0]
      });
      setIsEaten(newEaten);
      
      // Invalidate queries to update Progress and History pages in real-time
      queryClient.invalidateQueries(['progress', auth.currentUser?.uid]);
      queryClient.invalidateQueries(['mealPlan', auth.currentUser?.uid]);
      queryClient.invalidateQueries(['groceryList', auth.currentUser?.uid]);
      
      if (newEaten) setShowFeedback(true);
    } catch (err) {
      console.error("Error logging meal:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (r) => {
    setRating(r);
    try {
      await api.post('/meals/feedback', {
        userId: auth.currentUser.uid,
        mealId: mealId,
        rating: r
      });
      setTimeout(() => setShowFeedback(false), 1000);
    } catch (err) {
      console.error("Error saving feedback:", err);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative bg-white rounded-[3rem] border-2 transition-all duration-500 overflow-hidden ${
        isEaten ? 'border-green-500 shadow-2xl shadow-green-100/50' : 'border-gray-50 hover:border-green-100 hover:shadow-2xl hover:shadow-gray-100'
      }`}
    >
      <div className="p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex-grow space-y-4">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                isEaten ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {meal.type}
              </span>
              {meal.reason && (
                <span className="text-[10px] font-bold text-gray-300 italic">
                  — {meal.reason}
                </span>
              )}
            </div>
            
            <h3 
              onClick={() => navigate(`/recipe/${mealId}`)}
              className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight cursor-pointer group-hover:text-green-600 transition-colors leading-tight"
            >
              {meal.name}
            </h3>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs font-black text-gray-400">
                <FaFire className="text-orange-400" /> {meal.calories} <span className="opacity-40 uppercase text-[9px]">kcal</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-gray-400">
                <FaMoneyBillWave className="text-green-400" /> {meal.cost_ghs} <span className="opacity-40 uppercase text-[9px]">ghs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-gray-400">
                <FaClock className="text-blue-400" /> {meal.prep_time_min} <span className="opacity-40 uppercase text-[9px]">min</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center gap-4 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-50 pt-6 sm:pt-0 sm:pl-10">
            <button 
              onClick={handleToggleEaten}
              disabled={loading}
              className={`w-full sm:w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all shadow-lg active:scale-90 ${
                isEaten 
                  ? 'bg-green-600 text-white shadow-green-100' 
                  : 'bg-white text-gray-200 border-2 border-gray-50 hover:text-green-600 hover:border-green-100'
              }`}
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <FaCheckCircle size={24} />
              )}
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onSwap(); }}
              className="w-full sm:w-16 h-16 rounded-[1.8rem] bg-gray-50 text-gray-300 flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-all active:scale-90"
              title="Refresh this meal"
            >
              <FaSyncAlt size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 pt-8 border-t border-gray-50 overflow-hidden"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 text-center">How was your {meal.type.toLowerCase()}?</p>
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => handleRating(s)}
                    className={`text-2xl transition-all hover:scale-125 ${s <= rating ? 'text-amber-400' : 'text-gray-100'}`}
                  >
                    {s <= rating ? <FaStar /> : <FaRegStar />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:-translate-x-4 transition-all duration-500 hidden lg:block">
        <button onClick={() => navigate(`/recipe/${mealId}`)} className="w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-900 hover:text-green-600 border border-gray-50">
          <FaChevronRight />
        </button>
      </div>
    </motion.div>
  );
};

export default MealCard;
