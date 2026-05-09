import React from 'react';
import { FaHeart, FaTwitter, FaInstagram, FaFacebook, FaLeaf, FaLinkedin, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-white mb-6 group">
              <div className="bg-green-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                <FaLeaf className="text-white text-xl" />
              </div>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Healthify</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Transforming lives through AI-driven nutrition. Get personalized meal plans and habit tracking at your fingertips.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-600 transition-all duration-300">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-600 transition-all duration-300">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-600 transition-all duration-300">
                <FaLinkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-green-600 transition-all duration-300">
                <FaGithub size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link to="/" className="hover:text-green-400 transition">Dashboard</Link></li>
              <li><Link to="/tracker" className="hover:text-green-400 transition">Health Tracker</Link></li>
              <li><Link to="/history" className="hover:text-green-400 transition">Meal History</Link></li>
              <li><Link to="/profile" className="hover:text-green-400 transition">User Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><a href="#" className="hover:text-green-400 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-400 transition">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Newsletter</h4>
            <p className="text-xs text-gray-500 font-bold mb-4 uppercase tracking-tighter">Stay updated with health tips</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs w-full focus:outline-none focus:border-green-500 transition"
              />
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition shadow-lg shadow-green-900/20">
                <FaHeart size={14} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
          <p>&copy; {new Date().getFullYear()} Healthify Labs. All rights reserved.</p>
          <p className="flex items-center mt-4 md:mt-0">
            Designed & Developed with <FaHeart className="text-green-600 mx-2 animate-pulse" /> for Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
