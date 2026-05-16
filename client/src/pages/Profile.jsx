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
    <div className="min-h-screen bg-white font-sans selection:bg-green-100">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-50/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24">
        <header className="mb-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              {formData.profileImage || user?.photoURL ? (
                <img 
                  src={formData.profileImage || user?.photoURL} 
                  alt="Profile" 
                  className="relative w-48 h-48 rounded-[3rem] object-cover border-8 border-white shadow-2xl" 
                />
              ) : (
                <div className="relative w-48 h-48 rounded-[3rem] bg-white border-8 border-white shadow-2xl flex items-center justify-center text-gray-100">
                  <FaUserCircle size={120} />
                </div>
              )}
              <Link to="/edit-profile" className="absolute -bottom-4 -right-4 bg-gray-900 text-white p-5 rounded-3xl shadow-2xl hover:bg-black transition-all active:scale-90">
                <FaSave size={20} />
              </Link>
            </motion.div>

            <div className="text-center md:text-left">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="w-10 h-[2px] bg-green-600" />
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">User Profile</span>
              </motion.div>
              <h1 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                {user?.displayName || 'Protocol User'}.
              </h1>
              <p className="text-gray-400 text-xl font-medium max-w-md">
                Your biological identity and nutritional preferences stored in a secure decentralized state.
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Stats */}
          <div className="lg:col-span-8 space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <ProfileDataCard icon={<FaBirthdayCake />} label="Age" value={formData.age} unit="Years" color="text-pink-500" />
              <ProfileDataCard icon={<FaUser />} label="Stature" value={`${formData.height}cm / ${formData.weight}kg`} unit="Physical" color="text-blue-500" />
              <ProfileDataCard icon={<FaUtensils />} label="Preference" value={formData.dietaryPreferences || 'None'} unit="Nutritional" color="text-orange-500" />
              <ProfileDataCard icon={<FaTint />} label="Hydration" value={formData.hydrationTarget} unit="Daily Target" color="text-cyan-500" />
            </div>

            <div className="bg-gray-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />
              <div className="flex items-center gap-6 mb-10">
                <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center text-green-500"><FaHeart /></div>
                <h2 className="text-3xl font-black tracking-tight">Biological Goals</h2>
              </div>
              <p className="text-2xl font-medium leading-relaxed text-gray-300 italic">
                "{formData.healthGoals || 'No specific goals set yet.'}"
              </p>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 text-center">Settings</h3>
              <div className="space-y-4">
                <Link to="/edit-profile" className="w-full bg-gray-50 text-gray-900 font-black py-5 rounded-[1.5rem] hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
                  Edit Identity
                </Link>
                <button 
                  onClick={() => signOut(auth)}
                  className="w-full bg-gray-50 text-gray-900 font-black py-5 rounded-[1.5rem] hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                >
                  Terminate Session
                </button>
                <button 
                  onClick={handleDeleteProfile}
                  className="w-full bg-red-50 text-red-600 font-black py-5 rounded-[1.5rem] hover:bg-red-100 transition-all flex items-center justify-center gap-3"
                >
                  <FaTrash size={14} /> Wipe Account
                </button>
              </div>
            </div>

            <div className="bg-green-600 p-10 rounded-[3rem] shadow-2xl shadow-green-100 text-white text-center">
              <FaFire className="mx-auto text-4xl mb-6 opacity-30" />
              <h4 className="text-2xl font-black mb-2 tracking-tight">Elite Access</h4>
              <p className="text-green-100 text-sm font-medium opacity-80 leading-relaxed">
                Your profile is synchronized across all HealthMate biological nodes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileDataCard = ({ icon, label, value, unit, color }) => (
  <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/30 group hover:border-green-100 transition-all duration-500 relative">
    <div className={`${color} bg-current opacity-10 w-14 h-14 rounded-[1.5rem] mb-8 group-hover:scale-110 transition-transform`} />
    <div className={`absolute top-10 left-10 ${color} opacity-100`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-black text-gray-300 uppercase">{unit}</p>
    </div>
  </div>
);

export default Profile;
