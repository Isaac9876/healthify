import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHistory, FaCalendarAlt, FaChevronRight, FaUtensils, 
  FaCheckCircle, FaFire, FaMoneyBillWave, FaFilter,
  FaArrowLeft, FaRegCalendarCheck, FaChartLine
} from 'react-icons/fa';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'perfect', 'partial'
  const navigate = useNavigate();

  const fetchHistory = async (uid) => {
    try {
      setLoading(true);
      const res = await api.get(`/meals/history/${uid}`);
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await fetchHistory(currentUser.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const filteredHistory = history.filter(plan => {
    const eatenCount = plan.meals.filter(m => m.completed || m.eaten).length;
    if (filter === 'perfect') return eatenCount === plan.meals.length;
    if (filter === 'partial') return eatenCount > 0 && eatenCount < plan.meals.length;
    return true;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent shadow-xl"></div>
        <div className="text-center">
          <p className="text-gray-900 font-black uppercase tracking-[0.3em] text-xs">Analyzing Archive</p>
          <p className="text-gray-400 text-[10px] mt-1">Retrieving your nutritional journey...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 pb-32 font-sans">
      {/* High-End Header */}
      <header className="bg-white pt-20 pb-32 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-4">
                <span className="w-10 h-[2px] bg-green-600" />
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Nutritional Archive</span>
              </motion.div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">Your <span className="text-green-600">Journey</span>.</h1>
              <p className="text-gray-500 mt-4 text-xl font-medium max-w-xl">
                A professional record of every meal, calorie, and goal achieved.
              </p>
            </div>

            {/* Global Stats */}
            <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200 flex items-center gap-12 min-w-[320px]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Plans</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{history.length}</span>
                  <span className="text-xs opacity-50 font-bold uppercase">Days</span>
                </div>
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Consistency</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">
                    {history.length > 0 ? Math.round((history.filter(p => p.meals.some(m => m.eaten)).length / history.length) * 100) : 0}
                  </span>
                  <span className="text-xs opacity-50 font-bold uppercase">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 -mt-16">
        {/* Consistency Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <FaCheckCircle size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Perfect Days</p>
            <p className="text-3xl font-black text-gray-900">{history.filter(p => p.meals.every(m => m.eaten || m.completed)).length}</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <FaFire size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avg. Calories</p>
            <p className="text-3xl font-black text-gray-900">
              {history.length > 0 ? Math.round(history.reduce((acc, p) => acc + p.total_cal, 0) / history.length) : 0}
            </p>
          </div>
          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Weekly Activity</p>
              <div className="flex gap-2">
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const hasPlan = history.find(p => p.date.startsWith(dateStr));
                  const isEaten = hasPlan?.meals.some(m => m.eaten);
                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-10 rounded-lg transition-all ${
                        isEaten ? 'bg-green-500 shadow-lg shadow-green-100' : hasPlan ? 'bg-gray-200' : 'bg-gray-50'
                      }`} />
                      <span className="text-[8px] font-black text-gray-300 uppercase">{date.toLocaleDateString(undefined, { weekday: 'short' })[0]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-right">
              <button 
                onClick={() => setFilter(filter === 'perfect' ? 'all' : 'perfect')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === 'perfect' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {filter === 'perfect' ? 'Showing Perfect' : 'Filter Perfect'}
              </button>
            </div>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-[4rem] p-20 text-center shadow-xl border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <FaHistory className="text-gray-200 text-4xl" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No match found.</h2>
            <p className="text-gray-500 mb-10 text-xl max-w-md mx-auto leading-relaxed">Adjust your filters or generate today's plan to start building your history.</p>
            <button onClick={() => navigate('/')} className="bg-gray-900 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl hover:bg-black transition-all">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredHistory.map((plan, idx) => (
              <HistoryDay key={plan._id || idx} plan={plan} idx={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const FilterButton = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${
      active 
        ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-105' 
        : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

const HistoryDay = ({ plan, idx }) => {
  const navigate = useNavigate();
  const eatenCount = plan.meals.filter(m => m.completed || m.eaten).length;
  const isPerfect = eatenCount === plan.meals.length;

  const totals = plan.meals.reduce((acc, m) => ({
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0)
  }), { protein: 0, carbs: 0, fat: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden"
    >
      {/* Day Summary Bar */}
      <div className={`px-12 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-50 ${isPerfect ? 'bg-green-50/30' : 'bg-gray-50/30'}`}>
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isPerfect ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>
            <FaCalendarAlt />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {new Date(plan.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isPerfect ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {eatenCount} / {plan.meals.length} Meals Eaten
              </span>
              {isPerfect && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1"><FaCheckCircle /> Perfect Day</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Energy Consumed</p>
            <p className="text-xl font-black text-gray-900">{plan.total_cal} <span className="text-[10px] opacity-40">kcal</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Daily Investment</p>
            <p className="text-xl font-black text-gray-900">{Math.round(plan.total_cost_ghs)} <span className="text-[10px] opacity-40">ghs</span></p>
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plan.meals.map((meal, i) => {
            const mId = meal.mealId?._id || meal.mealId;
            return (
              <div 
                key={i} 
                onClick={() => mId && navigate(`/recipe/${mId}`)}
                className="group p-6 rounded-[2rem] border border-gray-50 bg-gray-50/20 hover:bg-white hover:border-green-100 hover:shadow-xl transition-all duration-500 cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${meal.eaten || meal.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {meal.type}
                  </span>
                  {(meal.eaten || meal.completed) && <FaCheckCircle className="text-green-500 shadow-sm" />}
                </div>
                <h4 className="font-black text-gray-900 mb-2 tracking-tight group-hover:text-green-600 transition-colors">{meal.name}</h4>
                <div className="flex items-center gap-3 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-500">
                    <FaFire className="text-orange-400" /> {meal.calories}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-gray-500">
                    <FaMoneyBillWave className="text-green-400" /> {meal.cost_ghs} GHS
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <FaChevronRight className="text-green-500 text-xs" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default History;
