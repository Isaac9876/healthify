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
  Filler
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWeight, FaTint, FaSmile, FaHistory, FaPlus, 
  FaCalendarAlt, FaChartArea, FaArrowUp, FaArrowDown, FaMinus,
  FaLightbulb, FaHeartbeat, FaInfoCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

const Tracker = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    weight: '',
    waterIntake: '',
    mood: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async (uid) => {
    try {
      const t = Date.now();
      const [historyRes, profileRes] = await Promise.allSettled([
        api.get(`/progress/${uid}?t=${t}`),
        api.get(`/auth/profile/${uid}?t=${t}`)
      ]);
      
      if (historyRes.status === 'fulfilled') {
        setHistory(Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchData(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMoodSelect = (mood) => {
    setFormData(prev => ({ ...prev, mood }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      await api.post('/progress', {
        uid: user.uid,
        date: today,
        weight: formData.weight,
        waterIntake: formData.waterIntake,
        mood: formData.mood
      });
      await fetchData(user.uid);
      setFormData({ weight: '', waterIntake: '', mood: '' });
      alert('Dashboard updated successfully!');
    } catch (err) {
      console.error("Error saving progress:", err);
      alert('Failed to update dashboard. Please try again.');
    }
    setSubmitting(false);
  };

  // BMI Calculation
  const calculateBMI = (weight, height) => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || h === 0) return 0;
    const heightInMeters = h / 100;
    return (w / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi) => {
    const b = parseFloat(bmi);
    if (!b || b === 0) return { label: 'Missing Info', color: 'text-gray-400' };
    if (b < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (b < 25) return { label: 'Normal', color: 'text-green-600' };
    if (b < 30) return { label: 'Overweight', color: 'text-amber-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  const lastEntry = history.length > 0 ? history[history.length - 1] : null;
  
  // Logic: Prefer today's log weight, fallback to profile weight
  const currentWeight = lastEntry?.weight || profile?.weight;
  const currentHeight = profile?.height;
  const targetWeight = profile?.targetWeight;

  const bmiValue = calculateBMI(currentWeight, currentHeight);
  const bmiCat = getBMICategory(bmiValue);
  const hasProfileInfo = !!currentHeight && (!!currentWeight || !!profile?.weight);
  const hasGoalInfo = !!targetWeight && !!currentWeight;

  const chartData = {
    labels: history.map(h => {
      const d = new Date(h.date);
      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Weight',
        data: history.map(h => h.weight || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10b981',
        borderWidth: 3,
      },
      {
        label: 'Hydration',
        data: history.map(h => h.waterIntake || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3b82f6',
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      annotation: {
        annotations: {
          goalLine: {
            type: 'line',
            yMin: parseFloat(targetWeight) || 0,
            yMax: parseFloat(targetWeight) || 0,
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              display: !!targetWeight,
              content: 'Target',
              position: 'end',
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: 'white',
              font: { size: 10, weight: 'bold' }
            }
          }
        }
      },
      tooltip: {
        backgroundColor: '#111827',
        padding: 12,
        cornerRadius: 12,
        usePointStyle: true,
      }
    },
    scales: {
      y: {
        grid: { color: '#f3f4f6', drawBorder: false },
        ticks: { font: { weight: '600', family: 'Inter' }, color: '#9ca3af' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { weight: '600', family: 'Inter' }, color: '#9ca3af' }
      }
    },
  };

  const getInsights = () => {
    if (history.length < 3) return "Log a few more days to unlock smart health insights!";
    const avgWater = history.reduce((acc, c) => acc + (c.waterIntake || 0), 0) / history.length;
    const waterTarget = profile?.hydrationTarget || 8;
    
    if (avgWater < waterTarget * 0.7) {
      return `You're averaging ${avgWater.toFixed(1)} glasses of water. Hydration is key to your ${profile?.healthGoals || 'goals'}.`;
    }
    
    const weightTrend = history[history.length - 1].weight - history[0].weight;
    if (weightTrend < 0 && profile?.healthGoals === 'Weight Loss') {
      return "Fantastic! You're losing weight consistently. Keep following your plan.";
    }
    
    return "Great consistency! You're building healthy habits one day at a time.";
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  const moods = [
    { label: 'Energetic', icon: '⚡' },
    { label: 'Happy', icon: '😊' },
    { label: 'Neutral', icon: '😐' },
    { label: 'Tired', icon: '😴' },
    { label: 'Stressed', icon: '😫' }
  ];

  return (
    <div className="bg-gray-50/30 min-h-screen pb-24 font-sans">
      <header className="bg-white pt-20 pb-28 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
            <div className="max-w-2xl">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 font-black uppercase tracking-[0.2em] text-[10px] mb-3 block">Advanced Analytics</motion.span>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight">Health <span className="text-green-600">Intelligence</span>.</h1>
              
              <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-start gap-4 max-w-xl">
                <FaLightbulb className="text-blue-500 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Coach's Insight</p>
                  <p className="text-blue-800/80 leading-relaxed font-medium">{getInsights()}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
              {/* BMI Card */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex items-center gap-6 group relative overflow-hidden">
                {!hasProfileInfo && (
                  <Link to="/profile" className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaExclamationTriangle className="text-amber-500 mb-2" />
                    <p className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Setup Profile First</p>
                  </Link>
                )}
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-2xl font-black">
                  {parseFloat(bmiValue) > 0 ? bmiValue : '--'}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current BMI</p>
                  <p className={`text-xl font-black ${bmiCat.color}`}>{bmiCat.label}</p>
                </div>
              </div>

              {/* Goal Card */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex items-center gap-6 group relative overflow-hidden">
                {!hasGoalInfo && (
                  <Link to="/profile" className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaInfoCircle className="text-blue-500 mb-2" />
                    <p className="text-[10px] font-black uppercase text-gray-900 tracking-widest">Set Weight Goal</p>
                  </Link>
                )}
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <FaWeight size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Goal Distance</p>
                  <p className="text-xl font-black text-gray-900">
                    {hasGoalInfo ? `${Math.abs(currentWeight - targetWeight).toFixed(1)} kg` : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 -mt-12">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-900 p-3 rounded-2xl text-white"><FaChartArea /></div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Performance Tracking</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Weight vs Hydration Over Time</p>
                  </div>
                </div>
              </div>

              <div className="h-[450px] w-full">
                {history.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300 border-4 border-dotted border-gray-50 rounded-[3rem]">
                    <FaCalendarAlt size={64} className="mb-6 opacity-10" />
                    <p className="text-xl font-black opacity-30">No Data Points Yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* History */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-gray-100 border border-gray-100">
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-gray-100 p-3 rounded-2xl text-gray-900"><FaHistory /></div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">History Log</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.slice().reverse().slice(0, 8).map((item, idx) => (
                  <div key={item._id} className="p-6 rounded-[2rem] bg-gray-50/50 border border-transparent hover:border-gray-200 hover:bg-white transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
                        {moods.find(m => m.label === item.mood)?.icon || '📅'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.mood || 'Standard'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Weight</p>
                        <p className="font-black text-gray-900">{item.weight} kg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Water</p>
                        <p className="font-black text-blue-600">{item.waterIntake} gls</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 sticky top-24 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
              <div className="flex items-center gap-4 mb-10 pt-4">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600"><FaPlus /></div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Today's Vitals</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Body Weight (kg)</label>
                  <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} placeholder="0.0" className="w-full pl-6 pr-5 py-5 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-[1.5rem] outline-none font-black text-xl transition-all" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Water Intake (Glasses)</label>
                  <input type="number" name="waterIntake" value={formData.waterIntake} onChange={handleChange} placeholder="0" className="w-full pl-6 pr-5 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] outline-none font-black text-xl transition-all" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Mood</label>
                  <div className="grid grid-cols-5 gap-2">
                    {moods.map(m => (
                      <button key={m.label} type="button" onClick={() => handleMoodSelect(m.label)} className={`p-4 rounded-2xl transition-all border-2 text-xl ${formData.mood === m.label ? 'bg-green-600 border-green-600 shadow-xl shadow-green-100 scale-105' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>{m.icon}</button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-gray-900 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 text-lg mt-4">{submitting ? 'Updating...' : 'Update Dashboard'}</button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracker;
