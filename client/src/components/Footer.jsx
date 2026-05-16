import React from 'react';
import { FaHeart, FaTwitter, FaInstagram, FaLeaf, FaDiscord, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, label }) => (
  <li>
    <Link to={to} className="text-sm font-medium text-gray-500 hover:text-green-500 transition-colors">
      {label}
    </Link>
  </li>
);

const SocialLink = ({ icon, href }) => (
  <a href={href} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all">
    {icon}
  </a>
);

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-32 pb-20 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-20 mb-32">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-green-600 p-2.5 rounded-xl shadow-xl shadow-green-900/40">
                <FaLeaf className="text-white text-xl" />
              </div>
              <span className="text-xl font-black tracking-[0.2em] uppercase">Health<span className="text-green-500">Mate</span></span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter mb-10">
              Precision <br/> Biological <br/> <span className="text-green-500">Optimization</span>.
            </h2>
            <div className="flex gap-6">
              <SocialLink icon={<FaInstagram />} href="#" />
              <SocialLink icon={<FaTwitter />} href="#" />
              <SocialLink icon={<FaDiscord />} href="#" />
              <SocialLink icon={<FaGithub />} href="#" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Ecosystem</h4>
                <ul className="space-y-4">
                  <FooterLink to="/" label="Neural Stream" />
                  <FooterLink to="/progress" label="Bio-Metrics" />
                  <FooterLink to="/grocery" label="Supply Chain" />
                  <FooterLink to="/history" label="Archives" />
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Node Settings</h4>
                <ul className="space-y-4">
                  <FooterLink to="/profile" label="User Identity" />
                  <FooterLink to="/edit-profile" label="Calibration" />
                  <FooterLink to="/tracker" label="Vitals Log" />
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8">Protocol Info</h4>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                  HealthMate is a high-performance nutritional synchronization engine designed for elite biological maintenance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-10 border-t border-white/5">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} HealthMate Operations. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">
            <a href="#" className="hover:text-green-500 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-green-500 transition-colors">Service Level Agreement</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
