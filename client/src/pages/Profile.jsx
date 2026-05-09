import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaBirthdayCake, FaUtensils, FaHeart, FaFire, FaTint, FaSave, FaUserCircle, FaTrash } from 'react-icons/fa';
import { signOut, deleteUser } from 'firebase/auth';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    dietaryPreferences: '',
    healthGoals: '',
    height: '',
    weight: '',
    activityLevel: '',
    allergies: '',
    medicalConditions: '',
    hydrationTarget: '8',
    profileImage: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await api.get(`/auth/profile/${currentUser.uid}`);
          if (res.data) {
            setUserProfile(res.data);
            setFormData({
              age: res.data.age || '',
              dietaryPreferences: res.data.dietaryPreferences ? res.data.dietaryPreferences.join(', ') : '',
              healthGoals: res.data.healthGoals || '',
              height: res.data.height || '',
              weight: res.data.weight || '',
              activityLevel: res.data.activityLevel || '',
              allergies: res.data.allergies ? res.data.allergies.join(', ') : '',
              medicalConditions: res.data.medicalConditions || '',
              hydrationTarget: res.data.hydrationTarget || '8',
              profileImage: res.data.profileImage || currentUser.photoURL || ''
            });
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete your profile? This will permanently remove your meal plans, progress history, and account data. This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      // 1. Delete from MongoDB
      await api.delete(`/auth/profile/${user.uid}`);
      
      // 2. Delete from Firebase
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteUser(currentUser);
      }
      
      alert('Your account and profile have been successfully deleted.');
      navigate('/login');
    } catch (err) {
      console.error("Error deleting profile:", err);
      // If Firebase requires recent login, sign out and ask to log in again
      if (err.code === 'auth/requires-recent-login') {
        alert('For security reasons, please log in again before deleting your account.');
        await signOut(auth);
        navigate('/login');
      } else {
        alert('Failed to delete profile. Please try again later.');
      }
    }
    setDeleting(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to save your profile.");
      return;
    }

    setSubmitting(true);

    const dietaryArray = formData.dietaryPreferences
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const allergyArray = formData.allergies
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    api.post('/auth/profile', {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0],
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight),
      activityLevel: formData.activityLevel,
      dietaryPreferences: dietaryArray,
      allergies: allergyArray,
      healthGoals: formData.healthGoals,
      medicalConditions: formData.medicalConditions,
      hydrationTarget: Number(formData.hydrationTarget),
      profileImage: formData.profileImage
    })
    .then(() => {
      alert('Profile updated successfully!');
      navigate('/');
    })
    .catch(err => {
      console.error("Error updating profile:", err);
      alert('Failed to update profile');
    })
    .finally(() => setSubmitting(false));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Preparing Profile</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 bg-white rounded-3xl shadow-xl shadow-green-100 mb-6"
          >
            {formData.profileImage ? (
              <img 
                src={formData.profileImage} 
                alt="Profile" 
                className="w-24 h-24 rounded-2xl object-cover" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=0D8ABC&color=fff&size=128`;
                }}
              />
            ) : (
              <FaUserCircle className="text-8xl text-gray-200" />
            )}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-gray-900 mb-2"
          >
            Personalize Your Journey
          </motion.h1>
          <p className="text-gray-500 text-lg">Tell us about yourself so we can tailor your experience.</p>
        </header>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100 overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            {/* Physical Info Section */}
            <div className="p-10 lg:p-12 border-b md:border-b-0 md:border-r border-gray-100 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-50 p-2.5 rounded-xl text-green-600">
                  <FaUser size={18} />
                </div>
                <h2 className="text-xl font-black text-gray-900">Physical Profile</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FaBirthdayCake className="text-pink-400" /> Age
                    </label>
                    <input 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleChange}
                      placeholder="Years"
                      min="1"
                      max="120"
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      Height (cm)
                    </label>
                    <input 
                      type="number" 
                      name="height" 
                      value={formData.height} 
                      onChange={handleChange}
                      placeholder="cm"
                      min="50"
                      max="300"
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      Weight (kg)
                    </label>
                    <input 
                      type="number" 
                      name="weight" 
                      value={formData.weight} 
                      onChange={handleChange}
                      placeholder="kg"
                      min="10"
                      max="500"
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      Activity Level
                    </label>
                    <select 
                      name="activityLevel" 
                      value={formData.activityLevel} 
                      onChange={handleChange}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-900"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Sedentary">Sedentary</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Active">Active</option>
                      <option value="Athlete">Athlete</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Medical Conditions
                  </label>
                  <input 
                    type="text" 
                    name="medicalConditions" 
                    value={formData.medicalConditions} 
                    onChange={handleChange}
                    placeholder="e.g. Diabetes, Hypertension, None"
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="p-10 lg:p-12 bg-gray-50/50 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                  <FaUtensils size={18} />
                </div>
                <h2 className="text-xl font-black text-gray-900">Personal Goals</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaUtensils className="text-orange-400" /> Dietary Preferences
                  </label>
                  <input 
                    type="text" 
                    name="dietaryPreferences" 
                    value={formData.dietaryPreferences} 
                    onChange={handleChange}
                    placeholder="e.g. Vegan, Keto, Ghanaian"
                    className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl transition-all outline-none font-bold text-gray-900 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Allergies
                  </label>
                  <input 
                    type="text" 
                    name="allergies" 
                    value={formData.allergies} 
                    onChange={handleChange}
                    placeholder="e.g. Peanuts, Shellfish"
                    className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl transition-all outline-none font-bold text-gray-900 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaHeart className="text-red-400" /> Health Goals
                  </label>
                  <textarea 
                    name="healthGoals" 
                    value={formData.healthGoals} 
                    onChange={handleChange}
                    placeholder="What do you want to achieve?"
                    rows="2"
                    className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl transition-all outline-none font-bold text-gray-900 shadow-sm resize-none"
                    required
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FaTint className="text-blue-500" /> Daily Water Target (Glasses)
                  </label>
                  <input 
                    type="number" 
                    name="hydrationTarget" 
                    value={formData.hydrationTarget} 
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className="w-full p-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl transition-all outline-none font-bold text-gray-900 shadow-sm"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    type="submit" 
                    disabled={submitting || deleting}
                    className="w-full bg-green-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
                  >
                    {submitting ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <><FaSave /> Save Profile</>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={handleDeleteProfile}
                    disabled={submitting || deleting}
                    className="w-full bg-white text-red-600 border-2 border-red-50 font-black py-4 rounded-[2rem] hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-3 text-base shadow-sm"
                  >
                    {deleting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <><FaTrash size={14} /> Delete Profile</>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                    Updates are applied instantly to your dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default Profile;
