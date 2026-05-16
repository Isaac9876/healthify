import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaUserPlus, FaLeaf, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';

// High-Res Colored Google SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Added for registration
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError('Failed to login with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // If name is provided, we'd update profile here
        await api.put('/auth/profile', { uid: userCred.user.uid, name, email });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message.includes('auth/user-not-found') ? 'User not found. Try registering!' : 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans overflow-hidden relative">
      {/* Top padding to account for Navbar */}
      <div className="lg:hidden h-20" />
      {/* Left Column: Design */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative p-20 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-green-500 rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white mb-32 group">
            <div className="bg-green-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-900 group-hover:rotate-12 transition-transform">
              <FaLeaf size={20} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Health<span className="text-green-500">Mate</span></span>
          </Link>
          
          <motion.h1 
            key={isRegistering ? 'reg' : 'log'}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl xl:text-9xl font-black text-white leading-[0.85] tracking-tighter"
          >
            {isRegistering ? 'Join the\n' : 'Welcome\n'}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {isRegistering ? 'Family.' : 'Back.'}
            </span>
          </motion.h1>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="flex gap-4">
            <div className="w-1.5 h-12 bg-green-600 rounded-full" />
            <p className="text-xl text-gray-400 font-medium max-w-sm">
              "The most intuitive health platform I've ever used. Simply brilliant."
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">U{i}</div>
              ))}
            </div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">+ 2,400 ACTIVE PROTOCOLS</p>
          </div>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20 relative bg-white overflow-y-auto">
        <div className="max-w-md w-full space-y-12 py-10">
          <div className="space-y-4">
            <div className="lg:hidden flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest mb-6">
              <FaLeaf /> HealthMate
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
              {isRegistering ? 'Register.' : 'Login.'}
            </h2>
            <p className="text-gray-400 font-medium text-xl">
              {isRegistering ? 'Start your high-performance life today.' : 'Enter your credentials to access your dashboard.'}
            </p>
          </div>

          <div className="space-y-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 border-2 border-gray-100 py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 group shadow-sm hover:shadow-xl hover:border-gray-200"
            >
              <GoogleIcon />
              <span className="text-xs font-black uppercase tracking-widest text-gray-900">Continue with Google</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-grow h-[1px] bg-gray-100" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">or use email</span>
              <div className="flex-grow h-[1px] bg-gray-100" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-6">
              {isRegistering && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegistering}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-[1.8rem] py-5 px-8 outline-none transition-all font-black text-gray-900"
                    placeholder="John Doe"
                  />
                </motion.div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-[1.8rem] py-5 pl-16 pr-8 outline-none transition-all font-black text-gray-900"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                <div className="relative group">
                  <FaLock className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-600 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-green-600 focus:bg-white rounded-[1.8rem] py-5 pl-16 pr-8 outline-none transition-all font-black text-gray-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 bg-red-50 text-red-600 p-5 rounded-2xl text-xs font-bold border border-red-100"
                  >
                    <FaExclamationCircle />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white font-black py-7 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 text-sm uppercase tracking-[0.2em]"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    {isRegistering ? 'Register Protocol' : 'Login Protocol'}
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-gray-50 text-center">
              <p className="text-gray-400 font-medium">
                {isRegistering ? 'Already part of the protocol?' : "New to HealthMate?"}{' '}
                <button 
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                  className="text-green-600 font-black hover:underline underline-offset-4"
                >
                  {isRegistering ? 'Login here' : 'Register now'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
