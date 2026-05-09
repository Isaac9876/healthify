import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { FaFire, FaClock, FaMoneyBillWave, FaArrowLeft, FaPlus, FaUtensils, FaCheck } from 'react-icons/fa';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white min-h-screen pb-20"
    >
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img 
          src={meal.image_url.startsWith('http') ? meal.image_url : `https://image.pollinations.ai/prompt/${encodeURIComponent(meal.name + ' delicious food photography')}?width=1200&height=800&nologo=true`}
          className="w-full h-full object-cover"
          alt={meal.name}
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition-all border border-white/30"
        >
          <FaArrowLeft />
        </button>
      </div>

      <div className="container mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
            <div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {meal.tags.map(tag => (
                  <span key={tag} className="bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-100">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                {meal.name}
              </h1>
              <p className="text-gray-500 mt-2 text-lg italic">{meal.cuisine} Cuisine</p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isLoading}
                className="flex-1 md:flex-none bg-green-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {addMutation.isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <><FaPlus /> Add to Week</>
                )}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-12 py-6 border-y border-gray-100">
            <div className="text-center">
              <div className="text-orange-600 bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FaFire />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Energy</p>
              <p className="text-lg font-black text-gray-900">{meal.calories} kcal</p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FaClock />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time</p>
              <p className="text-lg font-black text-gray-900">{meal.prep_time_min} min</p>
            </div>
            <div className="text-center">
              <div className="text-emerald-600 bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FaMoneyBillWave />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cost</p>
              <p className="text-lg font-black text-gray-900">{meal.cost_ghs} GHS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Ingredients */}
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-green-500 rounded-full" />
                Ingredients
              </h3>
              <div className="space-y-4">
                {meal.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-bold text-green-600 shadow-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">{ing.name}</p>
                        <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{ing.qty} {ing.unit}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-400">{ing.cost_ghs} GHS</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-green-500 rounded-full" />
                Preparation
              </h3>
              <div className="space-y-8">
                {meal.instructions.split('.').filter(s => s.trim()).map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-xl">
                      {i + 1}
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg pt-2">
                      {step.trim()}.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeDetail;
