import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaCheckCircle, FaPercentage, FaMoneyBillWave, 
  FaDna, FaArrowLeft, FaChevronRight, FaUtensils, FaFire
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
    enabled: !!auth.currentUser,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (isError || !data) return (
    <div className="container mx-auto px-6 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-800">We couldn't load your progress</h2>
      <button onClick={() => navigate('/')} className="text-green-600 mt-4 font-bold">Back to Home</button>
    </div>
  );

  const { summary } = data;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white min-h-screen pb-20 font-sans"
    >
      {/* Header */}
      <header className="bg-gray-50/50 pt-20 pb-32 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow-lg transition-all">
                  <FaArrowLeft size={12} />
                </button>
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Weekly Health Summary</span>
              </div>
              <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                My <span className="text-green-600">Progress</span>.
              </h1>
              <p className="text-gray-400 text-xl font-medium max-w-lg leading-tight">
                See how well you are reaching your healthy eating goals this week.
              </p>
            </div>

            <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex items-center gap-12 min-w-[320px]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">My Accuracy</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black">{summary.adherence_avg}</span>
                  <span className="text-xs opacity-50 font-bold uppercase">%</span>
                </div>
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Days Active</p>
                <div className="flex items-baseline gap-1 text-green-400">
                  <span className="text-5xl font-black">{summary.days_active}</span>
                  <span className="text-xs opacity-50 font-bold uppercase">Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <StatCard icon={<FaUtensils />} title="Total Meals Eaten" value={summary.total_meals_eaten} unit="Meals" color="text-green-500" />
          <StatCard icon={<FaCheckCircle />} title="Active Days" value={summary.days_active} unit="Days" color="text-blue-500" />
          <StatCard icon={<FaMoneyBillWave />} title="Money Saved" value={Math.round(summary.total_budget_saved_ghs)} unit="GHS Saved" color="text-amber-500" />
          <StatCard icon={<FaDna />} title="Avg. Protein" value={summary.avg_protein_g} unit="grams" color="text-purple-500" />
        </div>

        {summary.total_planned === 0 && (
          <div className="mt-20 text-center bg-gray-50/50 p-20 rounded-[4rem] border-2 border-dashed border-gray-200">
            <FaCalendarAlt className="mx-auto text-gray-200 text-7xl mb-8" />
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No Data Found</h3>
            <p className="text-gray-500 mb-12 text-xl max-w-md mx-auto">Start logging your meals today to see your progress here.</p>
            <button onClick={() => navigate('/')} className="bg-gray-900 text-white font-black py-6 px-16 rounded-[2.5rem] shadow-2xl hover:bg-black hover:-translate-y-1 transition-all">
              Go to Home
            </button>
          </div>
        )}

        {/* Daily Breakdown for better transparency */}
        {summary.total_planned > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tight px-4">Daily Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.days.map((day, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/30 flex justify-between items-center group hover:border-green-100 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long' })}
                    </p>
                    <h4 className="text-xl font-black text-gray-900">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h4>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className={`text-xs font-black ${day.logged_count === day.planned_count && day.planned_count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {day.logged_count} / {day.planned_count}
                      </span>
                      <FaCheckCircle className={day.logged_count === day.planned_count && day.planned_count > 0 ? 'text-green-500' : 'text-gray-100'} />
                    </div>
                    <div className="w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${day.adherence_pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, title, value, unit, color }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/30 group hover:border-green-100 transition-all duration-500 relative">
    <div className={`${color} bg-current opacity-10 w-14 h-14 rounded-[1.5rem] mb-8 group-hover:scale-110 transition-transform`} />
    <div className={`absolute top-10 left-10 ${color} opacity-100`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-4xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-black text-gray-300 uppercase">{unit}</p>
    </div>
  </div>
);

export default Progress;
