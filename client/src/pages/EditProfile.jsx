import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaUser, FaBirthdayCake, FaUtensils, FaHeart, FaFire, 
  FaTint, FaSave, FaUserCircle, FaVenusMars, FaMoneyBillWave, FaClock, FaTrash, FaArrowLeft
} from 'react-icons/fa';

const EditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [newTargets, setNewTargets] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    age: '',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: 'Sedentary',
    healthGoals: '',
    dietaryPreferences: '',
    allergies: '',
    budget_per_day_ghs: '100',
    max_cook_time_min: '60',
    hydrationTarget: '8',
    medicalConditions: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      const res = await api.get(`/auth/profile/${user.uid}`);
      if (res.data) {
        setFormData({
          name: res.data.name || '',
          gender: res.data.gender || 'Male',
          age: res.data.age || '',
          height: res.data.height || '',
          weight: res.data.weight || '',
          targetWeight: res.data.targetWeight || '',
          activityLevel: res.data.activityLevel || 'Sedentary',
          healthGoals: res.data.healthGoals || 'Maintenance',
          dietaryPreferences: res.data.dietaryPreferences?.join(', ') || '',
          allergies: res.data.allergies?.join(', ') || '',
          budget_per_day_ghs: res.data.budget_per_day_ghs || '100',
          max_cook_time_min: res.data.max_cook_time_min || '60',
          hydrationTarget: res.data.hydrationTarget || '8',
          medicalConditions: res.data.medicalConditions || ''
        });
      }
      return res.data;
    },
    enabled: !!user,
    retry: false
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put('/auth/profile', { 
        uid: user.uid, 
        email: user.email,
        ...data 
      });
      return res.data;
    },
    onSuccess: (data) => {
      setNewTargets(data.targets);
      // Invalidate both profile and meal plan so changes reflect everywhere
      queryClient.invalidateQueries(['profile', user?.uid]);
      queryClient.invalidateQueries(['mealPlan']);
      alert('Your settings have been saved!');
    },
    onError: (error) => {
      const msg = error.response?.data?.error || error.response?.data?.msg || 'Failed to update. Please try again.';
      alert(msg);
    }
  });

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure? This will delete your meal plans and all your progress. This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const uid = user.uid;
      await api.delete(`/auth/profile/${uid}`);
      queryClient.clear();
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await deleteUser(currentUser);
        } catch (fbErr) {
          await signOut(auth);
        }
      }
      alert('Your account and all data have been deleted.');
      navigate('/login');
    } catch (err) {
      console.error("Deletion error:", err);
      alert('Failed to delete account. Please try again later.');
    }
    setDeleting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-green-100">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-50/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24">
        <header className="mb-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow-lg transition-all">
                  <FaArrowLeft size={12} />
                </button>
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Settings</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                My <span className="text-green-600">Profile</span>.
              </h1>
              <p className="text-gray-400 text-xl font-medium max-w-lg leading-tight">
                Update your details and goals to keep your meal plans perfect for you.
              </p>
            </div>

            <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex items-center gap-12 min-w-[320px]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-green-500 text-3xl">
                  <FaUserCircle />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</p>
                  <p className="text-2xl font-black">{profile ? 'Active' : 'Wait...'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {newTargets && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-10 bg-green-600 text-white rounded-[3rem] shadow-2xl shadow-green-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl"><FaFire /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">New Goal Set</p>
                <h3 className="text-4xl font-black">Target: {newTargets.calories} kcal per day</h3>
              </div>
            </div>
            <button onClick={() => setNewTargets(null)} className="text-white font-black px-8 py-4 bg-black/20 rounded-2xl hover:bg-black/30 transition-all">Dismiss</button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid lg:grid-cols-2">
            
            {/* Left Column: Body Info */}
            <div className="p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-gray-100 space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm"><FaUser /></div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Body Info</h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[1.8rem] transition-all outline-none font-black text-xl text-gray-900 shadow-inner" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><FaVenusMars /> Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg appearance-none">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><FaBirthdayCake /> Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Height (cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Target (kg)</label>
                    <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Activity Level</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg appearance-none">
                    <option value="Sedentary">Sedentary (Little exercise)</option>
                    <option value="Lightly Active">Lightly Active</option>
                    <option value="Moderately Active">Moderately Active</option>
                    <option value="Very Active">Very Active</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Goals */}
            <div className="p-12 lg:p-16 bg-gray-50/30 space-y-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><FaUtensils /></div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Goals & Budget</h2>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><FaMoneyBillWave /> Daily Budget (GHS)</label>
                    <input type="number" name="budget_per_day_ghs" value={formData.budget_per_day_ghs} onChange={handleChange} className="w-full p-6 bg-white border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg shadow-sm" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><FaTint /> Water Goal</label>
                    <input type="number" name="hydrationTarget" value={formData.hydrationTarget} onChange={handleChange} className="w-full p-6 bg-white border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg shadow-sm" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2"><FaHeart /> Health Goal</label>
                  <select name="healthGoals" value={formData.healthGoals} onChange={handleChange} className="w-full p-6 bg-white border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg appearance-none shadow-sm">
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Maintenance">Keep Weight</option>
                    <option value="Weight Gain">Gain Weight</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Allergies (Avoid these)</label>
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Milk..." className="w-full p-6 bg-white border-2 border-transparent focus:border-green-500 rounded-[1.8rem] outline-none font-black text-lg shadow-sm" />
                </div>

                <div className="pt-10 space-y-6">
                  <button 
                    type="submit" 
                    disabled={updateMutation.isLoading || deleting}
                    className="w-full bg-gray-900 text-white font-black py-8 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:bg-black transition-all flex items-center justify-center gap-4 text-xl group"
                  >
                    {updateMutation.isLoading ? (
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>Save My Settings <FaSave className="group-hover:scale-110 transition-transform" /></>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={handleDeleteProfile}
                    disabled={updateMutation.isLoading || deleting}
                    className="w-full bg-white text-red-600 border border-red-50 font-black py-5 rounded-[2rem] hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                  >
                    {deleting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                    ) : (
                      <><FaTrash size={14} /> Delete Account</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
