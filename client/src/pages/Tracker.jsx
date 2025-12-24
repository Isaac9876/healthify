import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { motion } from 'framer-motion';
import { FaWeight, FaTint, FaFire } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Tracker = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    weight: '',
    waterIntake: '',
    caloriesConsumed: '',
    mood: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchHistory(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (uid) => {
    try {
      const res = await api.get(`/progress/${uid}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/progress', {
        uid: user.uid,
        date: today,
        weight: formData.weight,
        waterIntake: formData.waterIntake,
        caloriesConsumed: formData.caloriesConsumed,
        mood: formData.mood
      });
      alert('Progress saved!');
      fetchHistory(user.uid);
      setFormData({ weight: '', waterIntake: '', caloriesConsumed: '', mood: '' });
    } catch (err) {
      console.error("Error saving progress:", err);
      alert('Failed to save progress');
    }
  };

  // Chart Data Preparation
  const chartData = {
    labels: history.map(h => h.date),
    datasets: [
      {
        label: 'Weight (kg)',
        data: history.map(h => h.weight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress',
      },
    },
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-green-700 mb-10"
      >
        Track Your Progress
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Log Today's Data</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <FaWeight className="text-blue-500"/> Weight (kg)
              </label>
              <input 
                type="number" 
                name="weight" 
                value={formData.weight} 
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <FaTint className="text-blue-400"/> Water Intake (glasses)
              </label>
              <input 
                type="number" 
                name="waterIntake" 
                value={formData.waterIntake} 
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <FaFire className="text-red-500"/> Calories Consumed
              </label>
              <input 
                type="number" 
                name="caloriesConsumed" 
                value={formData.caloriesConsumed} 
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Mood</label>
              <select 
                name="mood" 
                value={formData.mood} 
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Mood</option>
                <option value="Energetic">Energetic</option>
                <option value="Happy">Happy</option>
                <option value="Tired">Tired</option>
                <option value="Stressed">Stressed</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition duration-300 shadow-lg"
            >
              Save Progress
            </button>
          </form>
        </motion.div>

        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">History Analysis</h2>
          {history.length > 0 ? (
            <Line options={options} data={chartData} />
          ) : (
            <p className="text-gray-500 text-center py-20">No data available yet. Start logging!</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Tracker;
