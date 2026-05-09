import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaCheckCircle, FaPercentage, FaMoneyBillWave, 
  FaDna, FaArrowLeft, FaChevronRight 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Progress = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['progress', auth.currentUser?.uid],
    queryFn: async () => {
      const res = await api.get(`/progress/week?userId=${auth.currentUser.uid}&date=${today}`);
      return res.data;
    },
    enabled: !!auth.currentUser
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (isError || !data) return (
    <div className="container mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-800">Failed to load progress data</h2>
      <button onClick={() => navigate('/')} className="text-green-600 mt-4 font-bold">Back to Dashboard</button>
    </div>
  );

  const { summary, days } = data;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50/50 min-h-screen pb-20 font-sans"
    >
      {/* Header */}
      <header className="bg-white pt-12 pb-24 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <FaArrowLeft />
            </button>
            <span className="text-green-600 font-black uppercase tracking-widest text-[10px]">Your Journey</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-12">
            Weekly <span className="text-green-600">Progress</span>.
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="text-green-600 bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <FaCheckCircle />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Meals Eaten</p>
              <p className="text-3xl font-black text-gray-900">{summary.days_eaten} <span className="text-sm text-gray-400">total</span></p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="text-blue-600 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <FaPercentage />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Adherence</p>
              <p className="text-3xl font-black text-gray-900">{summary.adherence_avg}%</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="text-amber-600 bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <FaMoneyBillWave />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Budget Used</p>
              <p className="text-3xl font-black text-gray-900">{summary.total_budget_saved_ghs} <span className="text-sm text-gray-400">GHS</span></p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="text-purple-600 bg-purple-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <FaDna />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Avg Protein</p>
              <p className="text-3xl font-black text-gray-900">{summary.avg_protein_g}g <span className="text-sm text-gray-400">/ meal</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* 7-Day Grid */}
      <div className="container mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {days.map((day, idx) => {
            const dateObj = new Date(day.date);
            const isToday = day.date === today;
            
            return (
              <motion.div 
                key={day.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 rounded-[2.5rem] border transition-all ${
                  isToday 
                    ? 'bg-green-600 text-white border-green-600 shadow-2xl shadow-green-100' 
                    : 'bg-white text-gray-900 border-gray-100 shadow-xl shadow-gray-100/50'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? 'text-green-200' : 'text-gray-400'}`}>
                  {dateObj.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="text-xl font-black mb-6">
                  {dateObj.getDate()} {dateObj.toLocaleDateString(undefined, { month: 'short' })}
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-widest opacity-60`}>Adherence</p>
                      <p className="text-2xl font-black">{day.adherence_pct}%</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full ${isToday ? 'bg-white' : 'bg-green-500'}`} 
                      style={{ width: `${day.adherence_pct}%` }} 
                    />
                  </div>

                  {day.planned_count > 0 && (
                    <p className={`text-[10px] font-bold ${isToday ? 'text-green-100' : 'text-gray-500'}`}>
                      {day.logged_count} / {day.planned_count} meals
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {summary.total_planned === 0 && (
          <div className="mt-12 text-center bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl">
            <FaCalendarAlt className="mx-auto text-gray-200 text-6xl mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">No Meals Planned Yet</h3>
            <p className="text-gray-500 mb-8">Start your nutrition journey by generating your first meal plan.</p>
            <button onClick={() => navigate('/')} className="bg-green-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-green-100">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Progress;
