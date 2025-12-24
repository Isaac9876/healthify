import React from 'react';
import { FaHeart, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Healthify</h2>
            <p className="text-gray-400 text-sm">Empowering your health journey with AI.</p>
          </div>
          
          <div className="flex space-x-6 mb-6 md:mb-0">
            <a href="#" className="text-gray-400 hover:text-white transition"><FaTwitter size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-white transition"><FaInstagram size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-white transition"><FaFacebook size={24} /></a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Healthify. All rights reserved.</p>
          <p className="flex items-center mt-4 md:mt-0">
            Made with <FaHeart className="text-red-500 mx-2" /> for a healthier world.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
