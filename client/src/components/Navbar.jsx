import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaUser, FaHistory, FaSignOutAlt, FaBars, FaTimes, FaSignInAlt, FaChartLine, FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

import api from '../api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const res = await api.get(`/auth/profile/${currentUser.uid}`);
          setProfile(res.data);
        } catch (err) {
          console.error("Navbar profile fetch error:", err);
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  const isActive = (path) => location.pathname === path ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600 hover:bg-gray-50';

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-gray-900 group">
          <div className="bg-green-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <FaLeaf className="text-white text-xl" />
          </div>
          <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">Healthify</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          <Link to="/" className={`${isActive('/')} px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`}>Home</Link>
          {user ? (
            <>
              <Link to="/tracker" className={`${isActive('/tracker')} px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2`}>
                <FaChartLine className="text-lg" />
                <span>Tracker</span>
              </Link>
              <Link to="/grocery" className={`${isActive('/grocery')} px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2`}>
                <FaShoppingCart className="text-lg" />
                <span>Grocery</span>
              </Link>
              <Link to="/progress" className={`${isActive('/progress')} px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2`}>
                <FaCheckCircle className="text-lg" />
                <span>Progress</span>
              </Link>
              <Link to="/profile" className={`${isActive('/profile')} px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2`}>
                {profile?.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt="Profile" 
                    className="w-6 h-6 rounded-full object-cover" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=0D8ABC&color=fff&size=32`;
                    }}
                  />
                ) : (
                  <FaUser className="text-lg" />
                )}
                <span>Profile</span>
              </Link>
              <Link to="/history" className={`${isActive('/history')} px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2`}>
                <FaHistory className="text-lg" />
                <span>History</span>
              </Link>
              <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
              <button 
                onClick={handleLogout} 
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <FaSignOutAlt className="text-sm" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-500 active:scale-95 transition-all shadow-sm hover:shadow-md flex items-center space-x-2"
            >
              <FaSignInAlt className="text-sm" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-b border-gray-100"
        >
          <div className="flex flex-col p-4 space-y-2">
            <Link to="/" className="p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
            {user ? (
              <>
                <Link to="/tracker" className="p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <FaChartLine /> Tracker
                </Link>
                <Link to="/grocery" className="p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <FaShoppingCart /> Grocery
                </Link>
                <Link to="/progress" className="p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <FaCheckCircle /> Progress
                </Link>
                <Link to="/profile" className="p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  {profile?.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt="Profile" 
                      className="w-6 h-6 rounded-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=0D8ABC&color=fff&size=32`;
                      }}
                    />
                  ) : (
                    <FaUser />
                  )}
                  Profile
                </Link>
                <Link to="/history" className="p-3 rounded-xl hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-3" onClick={() => setIsOpen(false)}>
                  <FaHistory /> History
                </Link>
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }} 
                  className="p-3 rounded-xl text-red-600 font-bold hover:bg-red-50 flex items-center gap-3 w-full text-left"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="p-3 rounded-xl bg-green-600 text-white font-bold text-center" onClick={() => setIsOpen(false)}>Login</Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
