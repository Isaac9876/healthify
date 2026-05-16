import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWeight, FaRulerVertical, FaHeartbeat, FaSmile, 
  FaInfoCircle, FaSave, FaCheckCircle, FaExclamationCircle,
  FaWalking, FaWater, FaBed, FaBrain, FaArrowLeft, FaUserCircle, FaArrowRight
} from 'react-icons/fa';
import api from '../api';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const Tracker = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [vitals, setVitals] = useState({
    weight: '',
    height: '',
    mood: 'Good',
    water: 2,
    sleep: 8,
    steps: 5000
  });

  const [hoveredMood, setHoveredMood] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const res = await api.get(`/auth/profile/${currentUser.uid}`);
          if (res.data) {
            setHasProfile(true);
            setVitals(prev => ({
              ...prev,
              weight: res.data.weight || '',
              height: res.data.height || '',
              mood: res.data.lastMood || 'Good'
            }));
          }
        } catch (err) {
          if (err.response?.status === 404) {
            setHasProfile(false);
          }
          console.error("Tracker profile fetch error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/auth/profile', {
        uid: user.uid,
        weight: vitals.weight,
        height: vitals.height,
        lastMood: vitals.mood
      });
      
      queryClient.invalidateQueries(['profile', user.uid]);
      queryClient.invalidateQueries(['mealPlan']);

      setMessage({ type: 'success', text: 'Daily stats saved!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setMessage({ type: 'error', text: 'Failed to save. Try again later.' });
    } finally {
      setSaving(false);
    }
  };

  const moods = [
    { label: 'Great', emoji: '🤩', color: 'bg-green-500' },
    { label: 'Good', emoji: '😊', color: 'bg-emerald-400' },
    { label: 'Okay', emoji: '😐', color: 'bg-amber-400' },
    { label: 'Bad', emoji: '😔', color: 'bg-orange-500' },
    { label: 'Awful', emoji: '😫', color: 'bg-red-500' },
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (!hasProfile) {
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
              Setup <span className="text-green-600">Profile</span>.
            </h1>
            <p className="text-gray-400 text-xl font-medium leading-relaxed">
              You need to create your profile before you can track your health metrics.
            </p>
          </div>
          <button 
            onClick={() => navigate('/edit-profile')}
            className="w-full bg-gray-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 text-xl group"
          >
            Create Profile Now <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/30 min-h-screen pb-32 font-sans">
      <header className="bg-white pt-20 pb-32 border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow-lg transition-all">
                <FaArrowLeft size={12} />
              </button>
              <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Daily Progress</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">
              My <span className="text-green-600">Health</span> Tracker.
            </h1>
            <p className="text-gray-500 text-xl font-medium leading-relaxed">
              Log your weight, height, and mood to keep your healthy eating plan accurate.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <motion.form 
              onSubmit={handleSave}
              className="bg-white rounded-[4rem] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 lg:p-16"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <FaWeight className="text-green-600" /> Current Weight (kg)
                  </label>
                  <input 
                    type="number" 
                    value={vitals.weight}
                    onChange={(e) => setVitals({...vitals, weight: e.target.value})}
                    placeholder="e.g. 70"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-3xl p-6 text-2xl font-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <FaRulerVertical className="text-green-600" /> Current Height (cm)
                  </label>
                  <input 
                    type="number" 
                    value={vitals.height}
                    onChange={(e) => setVitals({...vitals, height: e.target.value})}
                    placeholder="e.g. 175"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-3xl p-6 text-2xl font-black outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mb-16">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-8">
                  <FaSmile className="text-green-600" /> How do you feel today?
                </label>
                <div className="flex flex-wrap justify-between gap-4">
                  {moods.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onMouseEnter={() => setHoveredMood(m.label)}
                      onMouseLeave={() => setHoveredMood(null)}
                      onClick={() => setVitals({...vitals, mood: m.label})}
                      className={`flex-1 min-w-[80px] p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col items-center gap-4 group relative overflow-hidden ${
                        vitals.mood === m.label 
                          ? 'bg-gray-900 text-white shadow-2xl scale-110 z-10' 
                          : 'bg-gray-50 text-gray-400 hover:bg-white hover:shadow-xl'
                      }`}
                    >
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{m.emoji}</span>
                      <AnimatePresence>
                        {(vitals.mood === m.label || hoveredMood === m.label) && (
                          <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-[10px] font-black uppercase tracking-widest"
                          >
                            {m.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {vitals.mood === m.label && (
                        <div className={`absolute top-0 left-0 w-full h-1 ${m.color}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-6">
                <AnimatePresence mode="wait">
                  {message.text && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white font-black py-6 px-16 rounded-3xl shadow-2xl shadow-green-100 transition-all active:scale-95 flex items-center gap-4 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>Save Progress <FaSave /></>
                  )}
                </button>
              </div>
            </motion.form>
          </div>

          <div className="space-y-8">
            <StatBox icon={<FaWater />} title="Water Goal" value="2.5" unit="Liters" progress={75} color="bg-blue-500" />
            <StatBox icon={<FaWalking />} title="Daily Steps" value="8,432" unit="Steps" progress={84} color="bg-orange-500" />
            <StatBox icon={<FaBed />} title="Sleep Hours" value="7.5" unit="Hours" progress={90} color="bg-purple-500" />
            
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <FaBrain className="text-3xl text-green-500 mb-6 group-hover:rotate-12 transition-transform" />
              <h4 className="text-xl font-black mb-4 tracking-tight">Healthy Tip</h4>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">
                "Drinking water right after you wake up helps your body start the day with more energy."
              </p>
              <div className="w-full bg-white/10 h-[1px]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatBox = ({ icon, title, value, unit, progress, color }) => (
  <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 group hover:shadow-2xl transition-all duration-500">
    <div className="flex items-center gap-4 mb-6">
      <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center text-xl text-gray-900 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
        <p className="text-xl font-black text-gray-900">{value} <span className="text-[10px] text-gray-300 uppercase">{unit}</span></p>
      </div>
    </div>
    <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`h-full ${color}`} 
      />
    </div>
  </div>
);

export default Tracker;
