import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaUtensils, FaFire, FaClock, FaMoneyBillWave, FaSync, 
  FaThumbsDown, FaHeart, FaChevronRight, FaInfoCircle, FaTimes,
  FaCheckCircle, FaStar, FaBolt, FaLeaf, FaExclamationTriangle,
  FaSearch
} from 'react-icons/fa';
import Landing from './Landing';

const SkeletonCard = () => (
  <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden animate-pulse h-full">
    <div className="h-64 bg-gray-200" />
    <div className="p-10 space-y-4">
      <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
      <div className="h-4 bg-gray-100 rounded-lg w-full" />
      <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="h-12 bg-gray-200 rounded-2xl" />
        <div className="h-12 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [fbUser, setFbUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: mealPlan, isLoading, isError, error: mealPlanError, refetch } = useQuery({
    queryKey: ['mealPlan', fbUser?.uid],
    queryFn: async () => {
      const res = await api.get(`/meals/today?userId=${fbUser.uid}`);
      return res.data;
    },
    enabled: !!fbUser,
    staleTime: 1000 * 60 * 15,
  });

  const fullSwapMutation = useMutation({
    mutationFn: async () => {
      // Using a dedicated refresh endpoint is more reliable than DELETE + refetch
      return await api.post('/meals/refresh', { userId: fbUser.uid });
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['mealPlan', fbUser.uid], res.data);
      alert("Plan synchronized successfully!");
    },
    onError: (err) => {
      alert("Sync failed: " + (err.response?.data?.message || err.message));
    }
  });

  const singleSwapMutation = useMutation({
    mutationFn: async ({ mealId, index }) => {
      return await api.post('/meals/swap-single', { userId: fbUser.uid, mealId, index });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mealPlan']);
    },
  });

  const logMutation = useMutation({
    mutationFn: async ({ mealId, date, eaten, rating }) => {
      await api.post('/meals/log', { userId: fbUser.uid, mealId, date, eaten, rating });
    },
    onSettled: () => {
      queryClient.invalidateQueries(['mealPlan']);
    }
  });

  if (authLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (!fbUser) return <Landing />;

  const totals = mealPlan?.meals?.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    cost: acc.cost + (m.cost_ghs || 0),
    protein: acc.protein + (m.protein || 0)
  }), { calories: 0, cost: 0, protein: 0 }) || { calories: 0, cost: 0, protein: 0 };

  return (
    <div className="bg-gray-50/30 min-h-screen pb-32 font-sans">
      {/* Premium Header */}
      <header className="bg-white pt-20 pb-32 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px] bg-green-600" />
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Today's Protocol</span>
              </motion.div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">Fueling <span className="text-green-600">Growth</span>.</h1>
              <p className="text-gray-500 mt-4 text-xl font-medium max-w-xl">
                Your personalized nutrition path for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200 flex flex-wrap gap-12 min-w-[320px]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Total Energy</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{totals.calories}</span>
                  <span className="text-xs opacity-50 font-bold uppercase">kcal</span>
                </div>
              </div>
              <div className="w-[1px] h-12 bg-white/10 hidden sm:block" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Budget Usage</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{Math.round(totals.cost)}</span>
                  <span className="text-xs opacity-50 font-bold uppercase">/ {mealPlan?.userBudget || 150} ghs</span>
                </div>
              </div>
              <div className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center">
                <button 
                  onClick={() => fullSwapMutation.mutate()}
                  className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-2xl transition-all shadow-xl active:scale-90"
                  title="Regenerate Full Day"
                >
                  <FaSync className={fullSwapMutation.isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Meals Grid */}
      <main className="container mx-auto px-6 -mt-16">
        {/* Detection for Ghost Meals (deleted IDs) */}
        {mealPlan?.meals?.some(m => !m.mealId) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
              <FaExclamationTriangle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-900">Database Synchronization Required</h3>
              <p className="text-amber-700 font-medium">Your current plan contains meals that were updated during the price re-scaling. Please refresh your plan to sync with the new prices.</p>
            </div>
            <button 
              onClick={() => fullSwapMutation.mutate()}
              disabled={fullSwapMutation.isLoading}
              className="ml-auto bg-amber-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-amber-700 transition-all whitespace-nowrap flex items-center gap-3 disabled:opacity-50"
            >
              {fullSwapMutation.isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Syncing...
                </>
              ) : (
                "Refresh Plan Now"
              )}
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {isLoading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : isError ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[4rem] shadow-xl border border-red-50 px-10">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FaExclamationTriangle size={40} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">Sync Issue</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                {mealPlanError?.response?.status === 404 
                  ? "It looks like your health profile isn't fully set up yet. We need a few details to build your nutrition plan."
                  : (mealPlanError?.response?.data?.message || "Unable to connect to the health servers. Check your internet and try again.")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {mealPlanError?.response?.status === 404 ? (
                  <button 
                    onClick={() => navigate('/profile')} 
                    className="bg-green-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Set Up My Profile <FaChevronRight size={14} />
                  </button>
                ) : (
                  <button 
                    onClick={() => refetch()} 
                    className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black shadow-2xl active:scale-95 transition-all"
                  >
                    Try Re-Syncing Dashboard
                  </button>
                )}
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {mealPlan?.meals?.map((meal, index) => (
                <MealCard 
                  key={meal.mealId?._id || index}
                  meal={meal} 
                  index={index}
                  onLog={(data) => logMutation.mutate({ ...data, date: mealPlan.date })}
                  onSwap={() => singleSwapMutation.mutate({ mealId: (meal.mealId?._id || meal.mealId), index })}
                  isSwapping={singleSwapMutation.isPending && singleSwapMutation.variables?.index === index}
                  navigate={navigate}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

const MealCard = ({ meal, index, onLog, onSwap, isSwapping, navigate }) => {
  const mealId = meal.mealId?._id || meal.mealId;
  const isGhost = !meal.mealId;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`group bg-white rounded-[3.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-700 relative ${meal.eaten ? 'ring-4 ring-green-500/10' : ''}`}
    >
      {/* Visual Header */}
      <div className="h-64 relative overflow-hidden">
        <img 
          src={`https://image.pollinations.ai/prompt/${encodeURIComponent(meal.name + ' delicious professional food photography, minimalist high-end wellness style')}?width=800&height=600&nologo=true`}
          alt={meal.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/20">
            {meal.type}
          </span>
        </div>

        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black text-white leading-tight mb-2 tracking-tight">
              {meal.name}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold">
                <FaFire className="text-orange-400" /> {meal.calories}
              </div>
              <div className="flex items-center gap-1.5 text-white/90 text-xs font-bold">
                <FaMoneyBillWave className="text-green-400" /> {meal.cost_ghs} GHS
              </div>
            </div>
          </div>
          <button 
            onClick={onSwap}
            disabled={isSwapping}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-gray-900 transition-all active:scale-90"
          >
            {isSwapping ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <FaSync size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-10 flex-1 flex flex-col">
        <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
          <FaLeaf className="inline text-green-500 mr-2 opacity-50" />
          {meal.reason}
        </p>

        <div className="space-y-4">
          <div className="flex gap-3">
            <button 
              onClick={() => {
                if (isGhost) {
                  alert("This meal reference is outdated due to the price update. Please use the 'Refresh Plan' button at the top of the grid.");
                  return;
                }
                navigate(`/recipe/${mealId}`);
              }}
              className={`flex-1 font-black py-5 rounded-[1.8rem] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
                isGhost ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-black shadow-gray-200'
              }`}
            >
              Prepare <FaChevronRight size={12} />
            </button>
            <button 
              onClick={() => onLog({ mealId, eaten: !meal.eaten })}
              className={`w-16 rounded-[1.8rem] flex items-center justify-center transition-all border-2 ${
                meal.eaten 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'bg-white border-gray-100 text-gray-400 hover:border-green-500 hover:text-green-500'
              }`}
            >
              <FaCheckCircle size={24} />
            </button>
          </div>

          {meal.eaten && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-2 justify-center pt-2"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onLog({ mealId, eaten: true, rating: star })}
                  className={`text-2xl transition-all hover:scale-125 ${
                    (meal.rating || 0) >= star ? 'text-amber-400' : 'text-gray-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
