import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    dietaryPreferences: '',
    healthGoals: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await api.get(`/auth/profile/${currentUser.uid}`);
          if (res.data) {
            setFormData({
              age: res.data.age || '',
              dietaryPreferences: res.data.dietaryPreferences ? res.data.dietaryPreferences.join(', ') : '',
              healthGoals: res.data.healthGoals || ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to save your profile.");
      return;
    }

    const dietaryArray = formData.dietaryPreferences.split(',').map(item => item.trim());

    // Basic validation
    if (!formData.age || !formData.healthGoals) {
      alert("Please fill in all required fields.");
      return;
    }

    api.post('/auth/profile', {
      uid: user.uid,
      email: user.email,
      name: user.displayName || user.email.split('@')[0], // Fallback name
      age: formData.age,
      dietaryPreferences: dietaryArray,
      healthGoals: formData.healthGoals
    })
    .then(res => {
      alert('Profile Updated Successfully! Redirecting to Dashboard...');
      navigate('/');
    })
    .catch(err => {
      console.error("Error updating profile:", err);
      if (err.response) {
        alert(`Error: ${err.response.data.msg || err.response.statusText}`);
      } else if (err.request) {
        alert("Network Error: Could not reach the server.");
      } else {
        alert(`Error: ${err.message}`);
      }
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-green-600 p-6 text-white text-center">
          <h1 className="text-3xl font-bold">Your Health Profile</h1>
          <p className="opacity-90">Customize your experience for better results</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Age</label>
            <input 
              type="number" 
              name="age" 
              value={formData.age} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Dietary Preferences</label>
            <input 
              type="text" 
              name="dietaryPreferences" 
              value={formData.dietaryPreferences} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="e.g. Vegetarian, Low Carb, Ghanaian"
            />
            <p className="text-sm text-gray-500 mt-1">Separate multiple items with commas</p>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Health Goals</label>
            <textarea 
              name="healthGoals" 
              value={formData.healthGoals} 
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              placeholder="e.g. Lose 5kg in 2 months, Gain muscle mass"
              required
            ></textarea>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition duration-300 shadow-lg"
          >
            Save Profile
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
