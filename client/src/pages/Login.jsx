import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import { useQueryClient } from '@tanstack/react-query';

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      queryClient.clear(); // Clear cache for the new user session
      
      await api.post('/auth/profile', {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        profileImage: user.photoURL
      });
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;
      queryClient.clear(); // Clear cache for the new user session
      
      // Sync with MongoDB - ensuring name and profileImage are passed
      await api.post('/auth/profile', {
        uid: user.uid,
        email: user.email,
        name: name || user.displayName || user.email.split('@')[0],
        profileImage: user.photoURL || ''
      });

    } catch (error) {
      console.error("Auth Error:", error);
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-green-600 items-center justify-center p-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Healthy Food" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-700/80 to-emerald-900/90"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-white">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
              <FaLeaf className="text-white text-3xl" />
            </div>
            <span className="text-3xl font-black tracking-tight">Healthify</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black leading-tight mb-6"
          >
            Your journey to better health <span className="text-green-300 underline decoration-green-400/50">starts here.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-green-50/80 leading-relaxed"
          >
            Join over 1,000+ users who have transformed their lives through AI-driven nutrition and precise habit tracking.
          </motion.p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-green-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-gray-50/50">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center lg:text-left mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-3">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 font-medium italic">
              {isLogin ? 'Sign in to continue your progress' : 'Join us today and start your transformation'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-xl text-sm font-bold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
            {!isLogin && (
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl transition-all outline-none font-bold text-gray-900 shadow-sm shadow-gray-100"
                  required
                />
              </div>
            )}
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl transition-all outline-none font-bold text-gray-900 shadow-sm shadow-gray-100"
                required
              />
            </div>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl transition-all outline-none font-bold text-gray-900 shadow-sm shadow-gray-100"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <>{isLogin ? 'Sign In' : 'Sign Up'} <FaArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Secure Connect</span>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 p-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 font-bold text-gray-700 shadow-sm shadow-gray-100 group disabled:opacity-50"
          >
            <FcGoogle className="text-2xl" />
            <span>Continue with Google</span>
          </button>

          <p className="mt-10 text-center text-gray-500 font-medium">
            {isLogin ? "New to Healthify? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="text-green-600 font-black hover:underline underline-offset-4"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>

          <p className="mt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
            Protected by Industry Standard Encryption & Privacy Protocols
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
