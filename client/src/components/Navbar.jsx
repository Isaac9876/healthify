import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaUser, FaHistory, FaSignOutAlt, FaBars, FaTimes, FaChartLine, FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import api from '../api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'py-2 sm:py-4' : 'py-4 sm:py-8'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center transition-all duration-500 ${scrolled ? 'shadow-xl' : ''}`}>
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="bg-gray-900 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white group-hover:bg-green-600 transition-all duration-500 group-hover:rotate-12">
              <FaLeaf size={14} className="sm:text-[18px]" />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tighter text-gray-900 uppercase">Health<span className="text-green-600">Mate</span></span>
          </Link>

          {/* Desktop Menu - Show on MD (Tablet) and up */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" label="Home" active={isActive('/')} />
            {user ? (
              <>
                <NavLink to="/tracker" label="Tracker" active={isActive('/tracker')} />
                <NavLink to="/grocery" label="Groceries" active={isActive('/grocery')} />
                <NavLink to="/progress" label="Progress" active={isActive('/progress')} />
                <NavLink to="/history" label="Past" active={isActive('/history')} />
                
                <div className="w-[1px] h-6 bg-gray-100 mx-2" />
                
                <Link to="/profile" className="flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-all group">
                  {profile?.profileImage || user?.photoURL ? (
                    <img 
                      src={profile?.profileImage || user?.photoURL} 
                      alt="Profile" 
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-sm" 
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <FaUser size={10} />
                    </div>
                  )}
                  <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Profile</span>
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Logout"
                >
                  <FaSignOutAlt size={14} />
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-gray-900 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:shadow-2xl transition-all"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Button - Show on small screens only (below MD) */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 active:scale-90 transition-all">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-[70px] sm:top-[100px] bg-white z-[90] overflow-y-auto px-6 py-10"
          >
            <div className="flex flex-col gap-8">
              <MobileLink to="/" label="Home" onClick={() => setIsOpen(false)} />
              {user && (
                <>
                  <MobileLink to="/tracker" label="Tracker" onClick={() => setIsOpen(false)} />
                  <MobileLink to="/grocery" label="Grocery List" onClick={() => setIsOpen(false)} />
                  <MobileLink to="/progress" label="My Progress" onClick={() => setIsOpen(false)} />
                  <MobileLink to="/history" label="Past Meals" onClick={() => setIsOpen(false)} />
                  <div className="h-[1px] bg-gray-100 w-full" />
                  <MobileLink to="/profile" label="My Profile" onClick={() => setIsOpen(false)} />
                  <button onClick={handleLogout} className="text-left text-red-600 font-black uppercase tracking-widest text-sm p-4">Logout</button>
                </>
              )}
              {!user && <Link to="/login" className="bg-gray-900 text-white p-6 rounded-3xl text-center font-black uppercase tracking-widest text-xs" onClick={() => setIsOpen(false)}>Log In</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, label, active }) => (
  <Link 
    to={to} 
    className={`px-3 sm:px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${active ? 'text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
  >
    {label}
  </Link>
);

const MobileLink = ({ to, label, onClick }) => (
  <Link to={to} onClick={onClick} className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter hover:text-green-600 transition-colors px-4 py-2">
    {label}.
  </Link>
);

export default Navbar;
