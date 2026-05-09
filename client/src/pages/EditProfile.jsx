import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaUser, FaBirthdayCake, FaUtensils, FaHeart, FaFire, 
  FaTint, FaSave, FaUserCircle, FaVenusMars, FaMoneyBillWave, FaClock, FaTrash 
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

  // 1. Auth Listener
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

  // 2. Fetch current profile
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

  // 3. Update Mutation
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
      queryClient.invalidateQueries(['profile', user?.uid]);
      queryClient.invalidateQueries(['mealPlan']);
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      const msg = error.response?.data?.error || error.response?.data?.msg || 'Failed to update profile. Please try again.';
      alert(msg);
    }
  });

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you absolutely sure? This will permanently remove your meal plans, progress history, and account data. This cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const uid = user.uid;

      // 1. Delete from MongoDB first
      await api.delete(`/auth/profile/${uid}`);
      
      // 2. Clear all local state and cache
      queryClient.clear();
      
      // 3. Delete from Firebase
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await deleteUser(currentUser);
        } catch (fbErr) {
          console.error("Firebase delete error:", fbErr);
          // If Firebase delete fails (e.g. re-auth required), at least sign out
          await signOut(auth);
        }
      }
      
      alert('Your account and all associated data have been permanently deleted.');
      navigate('/login');
    } catch (err) {
      console.error("Error during deletion process:", err);
      const msg = err.response?.data?.msg || 'Failed to delete profile. Please try again later.';
      alert(msg);
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
    <div className="min-h-screen bg-gray-50/50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 inline-block">
            <FaUserCircle className="text-8xl text-green-100" />
          </motion.div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-500 text-lg">Manage your physical profile and nutrition goals.</p>
        </header>

        {newTargets && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-green-600 text-white rounded-[2rem] shadow-xl shadow-green-100 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Targets Updated</p>
              <h3 className="text-xl font-black">Your new daily target: {newTargets.calories} kcal</h3>
            </div>
            <button onClick={() => setNewTargets(null)} className="text-white/50 hover:text-white font-bold px-4 py-2 bg-white/10 rounded-xl">Got it</button>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2">
            
            {/* Left Column: Physical */}
            <div className="p-10 lg:p-12 border-b md:border-b-0 md:border-r border-gray-100 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2.5 rounded-xl text-green-600">
                  <FaUser />
                </div>
                <h2 className="text-xl font-black text-gray-900">Physical Profile</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaVenusMars /> Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaBirthdayCake /> Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Height (cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target (kg)</label>
                    <input type="number" name="targetWeight" value={formData.targetWeight} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activity Level</label>
                  <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold">
                    <option value="Sedentary">Sedentary (Little exercise)</option>
                    <option value="Lightly Active">Lightly Active</option>
                    <option value="Moderately Active">Moderately Active</option>
                    <option value="Very Active">Very Active</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Conditions</label>
                  <input type="text" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="e.g. None" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold" />
                </div>
              </div>
            </div>

            {/* Right Column: Preferences */}
            <div className="p-10 lg:p-12 bg-gray-50/30 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                  <FaUtensils />
                </div>
                <h2 className="text-xl font-black text-gray-900">Nutrition Goals</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaMoneyBillWave /> Budget (GHS)</label>
                    <input type="number" name="budget_per_day_ghs" value={formData.budget_per_day_ghs} onChange={handleChange} className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaTint /> Water Target</label>
                    <input type="number" name="hydrationTarget" value={formData.hydrationTarget} onChange={handleChange} className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold shadow-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaHeart /> Health Goal</label>
                  <select name="healthGoals" value={formData.healthGoals} onChange={handleChange} className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold shadow-sm">
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Weight Gain">Weight Gain</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allergies (comma separated)</label>
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Peanuts..." className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl outline-none font-bold shadow-sm" />
                </div>

                <div className="pt-6 space-y-4">
                  <button 
                    type="submit" 
                    disabled={updateMutation.isLoading || deleting}
                    className="w-full bg-green-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    {updateMutation.isLoading ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <><FaSave /> {profile ? 'Update Profile' : 'Save Changes'}</>
                    )}
                  </button>

                  {profile && (
                    <button 
                      type="button"
                      onClick={handleDeleteProfile}
                      disabled={updateMutation.isLoading || deleting}
                      className="w-full bg-white text-red-600 border-2 border-red-50 font-black py-4 rounded-[2rem] hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                    >
                      {deleting ? (
                        <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                      ) : (
                        <><FaTrash size={14} /> Delete Account</>
                      )}
                    </button>
                  )}
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
