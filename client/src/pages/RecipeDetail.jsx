import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { FaFire, FaClock, FaMoneyBillWave, FaArrowLeft, FaPlus, FaUtensils, FaLeaf, FaInstagram, FaTwitter, FaDiscord } from 'react-icons/fa';
import Footer from '../components/Footer';

const Badge = ({ icon, label, color }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${color}`}>
    {icon} {label}
  </div>
);

const SocialLink = ({ href, label }) => (
  <a href={href} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all">
    {label === 'Instagram' && <FaInstagram />}
    {label === 'Twitter' && <FaTwitter />}
    {label === 'Discord' && <FaDiscord />}
  </a>
);

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-sm font-medium text-gray-500 hover:text-green-500 transition-colors">
      {label}
    </Link>
  </li>
);

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: meal, isLoading, isError } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await api.get(`/meals/recipe/${id}`);
      return res.data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser) throw new Error('Not logged in');
      const res = await api.post('/meals/plan/add', {
        userId: auth.currentUser.uid,
        mealId: id,
        type: 'Extra'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mealPlan']);
      alert('Meal added to today\'s plan!');
      navigate('/');
    },
    onError: (err) => {
      alert('Failed to add meal: ' + (err.response?.data?.message || err.message));
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (isError || !meal) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h2 className="text-2xl font-bold text-gray-800">Recipe not found</h2>
      <button onClick={() => navigate(-1)} className="text-green-600 font-bold">Go Back</button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-32 font-sans selection:bg-green-100">
      {/* Premium Header */}
      <header className="bg-gray-50/50 pt-24 pb-40 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow-lg transition-all">
                  <FaArrowLeft size={12} />
                </button>
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Nutritional Blueprint</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-10">
                {meal.name}.
              </h1>
              
              <div className="flex flex-wrap gap-4">
                <Badge icon={<FaClock />} label={`${meal.prep_time_min} Minutes`} color="bg-gray-900 text-white" />
                <Badge icon={<FaFire />} label={`${meal.calories} Calories`} color="bg-orange-50 text-orange-600" />
                <Badge icon={<FaUtensils />} label={meal.category || 'Standard'} color="bg-green-50 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-10 min-w-[320px]">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Protein</p>
                <p className="text-3xl font-black text-gray-900">{meal.protein_g || 0}g</p>
              </div>
              <div className="w-[1px] h-12 bg-gray-100" />
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Carbs</p>
                <p className="text-3xl font-black text-gray-900">{meal.carbs_g || 0}g</p>
              </div>
              <div className="w-[1px] h-12 bg-gray-100" />
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Fat</p>
                <p className="text-3xl font-black text-gray-900">{meal.fat_g || 0}g</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-20 relative z-20">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Ingredients Column */}
          <div className="lg:col-span-4">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4">
                <span className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xs">01</span>
                Essential Inputs
              </h2>
              <ul className="space-y-6">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between group">
                    <span className="text-gray-500 font-bold group-hover:text-gray-900 transition-colors">{ing.name}</span>
                    <span className="bg-gray-50 px-3 py-1 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{ing.qty} {ing.unit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-12 pt-10 border-t border-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Market Estimate</p>
                <p className="text-4xl font-black text-gray-900">{meal.cost_ghs} <span className="text-xs uppercase opacity-30">GHS</span></p>
              </div>

              <button 
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isLoading}
                className="w-full mt-10 bg-green-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-green-100 flex items-center justify-center gap-3 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {addMutation.isLoading ? 'Processing...' : <><FaPlus /> Add to Daily Plan</>}
              </button>
            </div>
          </div>

          {/* Instructions Column */}
          <div className="lg:col-span-8">
            <div className="bg-white p-12 lg:p-20 rounded-[4rem] shadow-2xl border border-gray-50">
              <h2 className="text-3xl font-black text-gray-900 mb-16 flex items-center gap-6">
                <div className="bg-green-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white text-2xl shadow-2xl shadow-green-100">
                  <FaUtensils />
                </div>
                Preparation Protocol
              </h2>
              
              <div className="space-y-16">
                {meal.instructions.split('.').filter(s => s.trim()).map((step, i) => (
                  <div key={i} className="flex gap-10 group">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center text-sm font-black text-gray-300 group-hover:border-green-500 group-hover:text-green-600 transition-all">
                        {i + 1}
                      </div>
                      <div className="flex-1 w-[2px] bg-gray-50 group-last:hidden" />
                    </div>
                    <div className="pb-4">
                      <p className="text-xl font-medium text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                        {step.trim()}.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecipeDetail;
