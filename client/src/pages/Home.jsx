import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSyncAlt, FaCheckCircle, FaFire, FaClock, FaMoneyBillWave, 
  FaChevronRight, FaPlus, FaUtensils, FaInfoCircle, FaWalking, 
  FaTint, FaUserCircle, FaArrowRight, FaExclamationTriangle, FaHistory
} from 'react-icons/fa';

// Components
import MealCard from '../components/MealCard';

const Home = () => {
  const [fbUser, setFbUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      setAuthLoading(false);
      if (!user && !authLoading) navigate('/landing');
    });
    return () => unsubscribe();
  }, [navigate, authLoading]);

  // Fetch Profile
  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ['profile', fbUser?.uid],
    queryFn: async () => {
      try {
        const res = await api.get(`/auth/profile/${fbUser.uid}`);
        return res.data;
      } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!fbUser,
  });

  // Fetch Today's Meal Plan
  const { data: mealPlan, isLoading: planLoading, refetch: refetchPlan } = useQuery({
    queryKey: ['mealPlan', fbUser?.uid],
    queryFn: async () => {
      const res = await api.get(`/meals/today?userId=${fbUser.uid}`);
      return res.data;
    },
    enabled: !!fbUser && !!profile, // Only fetch plan if profile exists
  });

  // Mutations
  const refreshMutation = useMutation({
    mutationFn: async () => await api.post('/meals/refresh', { userId: fbUser.uid }),
    onSuccess: () => queryClient.invalidateQueries(['mealPlan', fbUser.uid]),
  });

  const singleSwapMutation = useMutation({
    mutationFn: async ({ mealId, index }) => {
      const res = await api.post('/meals/swap-single', { userId: fbUser.uid, mealId, index });
      return res.data;
    },
    onSuccess: (newPlan) => {
      queryClient.setQueryData(['mealPlan', fbUser.uid], newPlan);
    },
  });

  if (authLoading || profileLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  // If no profile, show a beautiful setup prompt
  if (!profile && !profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center space-y-10"
        >
          <div className="w-32 h-32 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-100/50">
            <FaUserCircle size={64} />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-tight">
              Let's get <span className="text-green-600">started</span>.
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed">
              We need a few details like your age, weight, and budget to create your perfect healthy eating plan.
            </p>
          </div>
          <button 
            onClick={() => navigate('/edit-profile')}
            className="w-full bg-gray-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 text-xl group"
          >
            Create My Profile <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  const totals = mealPlan?.meals?.reduce((acc, m) => ({
    cal: acc.cal + (m.calories || 0),
    cost: acc.cost + (m.cost_ghs || 0)
  }), { cal: 0, cost: 0 }) || { cal: 0, cost: 0 };

  return (
    <div className="bg-white min-h-screen pb-32 font-sans selection:bg-green-100">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-50/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15]" />
      </div>

      <header className="pt-24 pb-40 container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Today's Protocol</span>
              <div className="h-[1px] w-12 bg-green-200" />
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-[8rem] font-black text-gray-900 tracking-tighter leading-[0.85] mb-4">
              Hello, <br/>
              <span className="text-green-600">{profile?.name?.split(' ')[0] || 'User'}.</span>
            </h1>
            <p className="text-gray-400 text-xl font-medium max-w-md leading-tight">
              Your optimized meal plan is ready for today.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <StatBox label="Daily Budget" value={Math.round(totals.cost)} target={mealPlan?.userBudget || 150} unit="ghs" color="bg-green-600" />
            <StatBox label="Calories" value={Math.round(totals.cal)} target={profile?.targets?.calories || 2500} unit="kcal" color="bg-gray-900" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-10">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                Today's Meals <FaUtensils className="text-green-600 text-xl" />
              </h2>
              <button 
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isLoading}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
              >
                {refreshMutation.isLoading ? 'Refreshing...' : <>Refresh Plan <FaSyncAlt className={refreshMutation.isLoading ? 'animate-spin' : ''} /></>}
              </button>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {mealPlan?.meals?.map((meal, index) => (
                  <MealCard 
                    key={meal.mealId?._id || index}
                    meal={meal} 
                    index={index}
                    onSwap={() => singleSwapMutation.mutate({ mealId: (meal.mealId?._id || meal.mealId), index })}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-gray-50/50 p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-100/20">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                Quick Actions <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
              </h3>
              <div className="space-y-4">
                <QuickAction icon={<FaWalking />} label="Log Activity" sub="Track your movement" onClick={() => navigate('/tracker')} />
                <QuickAction icon={<FaTint />} label="Water Intake" sub="Stay hydrated" onClick={() => navigate('/tracker')} />
                <QuickAction icon={<FaHistory />} label="Meal History" sub="View past protocols" onClick={() => navigate('/history')} />
              </div>
            </div>

            <div className="bg-green-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-green-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <FaFire className="text-3xl mb-6 group-hover:rotate-12 transition-transform" />
              <h4 className="text-2xl font-black mb-2">Protocol Tip</h4>
              <p className="text-white/80 font-medium leading-relaxed text-sm">
                Focus on high-protein meals early in the day to maintain muscle mass and focus.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatBox = ({ label, value, target, unit, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100/50 border border-gray-100 group min-w-[180px]">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className="text-4xl font-black text-gray-900">{value}</span>
      <span className="text-xs opacity-50 font-bold uppercase">/ {target} {unit}</span>
    </div>
    <div className="mt-6 w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / target) * 100, 100)}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`h-full ${color}`} 
      />
    </div>
  </div>
);

const QuickAction = ({ icon, label, sub, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:border-green-100 transition-all group"
  >
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-green-600 group-hover:bg-green-50 transition-all">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-black text-gray-900">{label}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
    <FaChevronRight className="text-gray-200 group-hover:text-green-600 transition-all" size={12} />
  </button>
);

export default Home;
