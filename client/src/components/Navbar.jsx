import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaUser, FaHistory, FaSignOutAlt, FaBars, FaTimes, FaSignInAlt, FaChartLine } from 'react-icons/fa';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  const isActive = (path) => location.pathname === path ? 'text-yellow-300 font-bold' : 'text-white hover:text-yellow-200';

  return (
    <nav className="bg-gradient-to-r from-green-600 to-teal-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white">
          <FaLeaf className="text-yellow-300" />
          <span>Healthify</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`${isActive('/')} transition duration-300`}>Home</Link>
          {user ? (
            <>
              <Link to="/tracker" className={`${isActive('/tracker')} transition duration-300 flex items-center gap-1`}><FaChartLine /> Tracker</Link>
              <Link to="/profile" className={`${isActive('/profile')} transition duration-300`}>Profile</Link>
              <Link to="/history" className={`${isActive('/history')} transition duration-300`}>History</Link>
              <button 
                onClick={handleLogout} 
                className="bg-white text-green-700 px-4 py-2 rounded-full font-semibold hover:bg-yellow-100 transition duration-300 flex items-center space-x-2"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-green-700 px-4 py-2 rounded-full font-semibold hover:bg-yellow-100 transition duration-300 flex items-center space-x-2"
            >
              <FaSignInAlt />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white text-2xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-green-700 text-white"
        >
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/" className="hover:text-yellow-300" onClick={() => setIsOpen(false)}>Home</Link>
            {user ? (
              <>
                <Link to="/tracker" className="hover:text-yellow-300 flex items-center gap-2" onClick={() => setIsOpen(false)}><FaChartLine /> Tracker</Link>
                <Link to="/profile" className="hover:text-yellow-300" onClick={() => setIsOpen(false)}>Profile</Link>
                <Link to="/history" className="hover:text-yellow-300" onClick={() => setIsOpen(false)}>History</Link>
                <button onClick={handleLogout} className="text-left hover:text-yellow-300">Logout</button>
              </>
            ) : (
              <Link to="/login" className="hover:text-yellow-300" onClick={() => setIsOpen(false)}>Login</Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
