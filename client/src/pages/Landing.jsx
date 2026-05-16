import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaLeaf, FaBolt, FaArrowRight, FaShieldAlt, FaUtensils, 
  FaUsers, FaChartLine, FaCheckCircle, FaChevronRight,
  FaHeartbeat, FaMagic, FaWallet, FaGlobe, FaAward, FaLock,
  FaSearch, FaBrain, FaCalculator, FaHistory
} from 'react-icons/fa';
import Footer from '../components/Footer';

const Landing = () => {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-green-100 overflow-hidden">
      {/* Floating Header Spacer */}
      <div className="h-24 sm:h-32" />

      {/* Hero Section */}
      <section className="relative container mx-auto px-6 pt-10 sm:pt-20 pb-40">
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-green-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
          <div className="flex-1 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-green-50 px-6 py-2 rounded-full text-green-600 font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <FaAward /> Excellence in Nutrition AI
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-[10rem] font-black text-gray-900 leading-[0.85] tracking-tighter"
            >
              Precision <span className="text-green-600">Fuel</span>. <br/> 
              Peak <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent">Result</span>.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-xl sm:text-2xl font-medium max-w-xl leading-tight"
            >
              The world's first AI-powered health protocol designed specifically for the modern Ghanaian lifestyle. Budget-smart, Goal-driven.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6 pt-6"
            >
              <Link to="/login" className="bg-gray-900 text-white font-black py-7 px-16 rounded-[2.5rem] shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center gap-4 text-sm uppercase tracking-widest group">
                Access Protocol <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <div className="flex items-center gap-4 px-6 border-l border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Available globally</p>
                <FaGlobe className="text-green-500" />
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative hidden lg:block"
          >
            <div className="relative z-10 bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 p-12 overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-2xl">
                    <FaUtensils />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol V2.0</p>
                    <h4 className="text-xl font-black text-gray-900 tracking-tight">Daily Meal Plan</h4>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <FaCheckCircle size={20} />
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-40 bg-gray-50 rounded-full" />
                  <div className="h-4 w-12 bg-green-50 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="bg-gray-50 p-8 rounded-[2rem] space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Budget</p>
                    <p className="text-3xl font-black text-gray-900">₵150.00</p>
                  </div>
                  <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-2">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Metabolic Rate</p>
                    <p className="text-3xl font-black">2.4k kcal</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/30 overflow-hidden">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-10">Optimizing nutrition for the modern Ghanaian professional</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-32 grayscale opacity-30">
            <div className="text-2xl font-black tracking-tighter">ACCRA_HEALTH</div>
            <div className="text-2xl font-black tracking-tighter">TECH_FUEL</div>
            <div className="text-2xl font-black tracking-tighter">GH_PRO</div>
            <div className="text-2xl font-black tracking-tighter">ELITE_LOGS</div>
          </div>
        </div>
      </section>

      {/* How It Works Section - DETAILED */}
      <section className="py-40 container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-20">
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <span className="text-green-600 font-black uppercase tracking-[0.4em] text-[10px]">The Workflow</span>
              <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">
                How it <br/> <span className="text-green-600">Works</span>.
              </h2>
            </div>
            <p className="text-gray-400 text-xl font-medium leading-relaxed">
              HealthMate simplifies your nutrition by merging advanced AI with local Ghanaian food databases. We handle the math so you can focus on your life.
            </p>
            
            <div className="space-y-8">
              <WorkStep icon={<FaCalculator />} title="Biometric Profiling" desc="We calculate your TDEE (Total Daily Energy Expenditure) based on your weight, age, and activity level." />
              <WorkStep icon={<FaBrain />} title="AI Meal Synthesis" desc="Our engine scans thousands of local meal combinations to find the perfect macro-balance for your day." />
              <WorkStep icon={<FaWallet />} title="Budget Constraints" desc="We filter suggestions based on real-world ingredient costs in Ghana, ensuring you never overspend." />
            </div>
          </div>

          <div className="lg:col-span-7 bg-gray-50/50 rounded-[4rem] p-8 sm:p-20 border border-gray-100">
            <div className="grid sm:grid-cols-2 gap-10">
              <div className="space-y-10">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                    <FaSearch />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">Smart Search</h4>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">We find recipes that use common Ghanaian ingredients like Yam, Cassava, and local Greens.</p>
                </div>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-gray-200">
                    <FaHistory />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">Progress Logs</h4>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">Track every gram of protein and every cedi saved with automatic historical logs.</p>
                </div>
              </div>
              <div className="space-y-10 sm:mt-20">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
                    <FaShieldAlt />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">Privacy First</h4>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">Your health data is encrypted and never shared. We value your personal privacy.</p>
                </div>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-100">
                    <FaMagic />
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">Daily Refresh</h4>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">Don't like a suggested meal? Swap it instantly for a fresh, healthy alternative.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-40 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-500 rounded-full blur-[160px] opacity-10 translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-24 space-y-4">
            <span className="text-green-500 font-black uppercase tracking-[0.4em] text-[10px]">Membership Plans</span>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter">The <span className="text-green-500">Standard</span> is Free.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="bg-white/5 border border-white/10 p-12 rounded-[3.5rem] hover:bg-white/10 transition-all">
              <h3 className="text-2xl font-black mb-2">Standard Protocol</h3>
              <p className="text-gray-500 font-medium mb-10">Perfect for daily health tracking.</p>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-6xl font-black">₵0</span>
                <span className="text-gray-500 font-bold uppercase text-[10px]">/ Lifetime</span>
              </div>
              <ul className="space-y-6 mb-16">
                <PricingItem text="AI-Generated Ghanaian Meal Plans" />
                <PricingItem text="Budget Monitoring System" />
                <PricingItem text="Weekly Progress Reports" />
                <PricingItem text="Nutritional Breakdown" />
              </ul>
              <Link to="/login" className="block text-center py-6 border border-white/20 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-gray-900 transition-all">Start Now</Link>
            </div>

            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl relative">
              <div className="absolute top-8 right-8 bg-green-100 text-green-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Premium</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Pro Protocol</h3>
              <p className="text-gray-400 font-medium mb-10">Coming soon for elite performers.</p>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-6xl font-black text-gray-900">₵49</span>
                <span className="text-gray-400 font-bold uppercase text-[10px]">/ Month</span>
              </div>
              <ul className="space-y-6 mb-16 text-gray-600">
                <PricingItem text="Personalized 1-on-1 Coaching" active />
                <PricingItem text="Advanced Wearable Integration" active />
                <PricingItem text="Premium Grocery Discounts" active />
                <PricingItem text="Priority AI Server Access" active />
              </ul>
              <button disabled className="w-full text-center py-6 bg-gray-100 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-[10px]">Waitlist Only</button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-40 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-100/50">
            <FaUsers size={32} />
          </div>
          <h2 className="text-5xl lg:text-[7rem] font-black text-gray-900 tracking-tighter leading-none">
            Join the <span className="text-green-600">Elite</span>.
          </h2>
          <p className="text-gray-400 text-2xl font-medium max-w-2xl mx-auto leading-tight">
            Over 2,400 Ghanaians are already using HealthMate to achieve their health goals. Secure, Private, Professional.
          </p>
          <div className="pt-10">
            <Link to="/login" className="bg-gray-900 text-white font-black py-8 px-24 rounded-[2.5rem] shadow-3xl hover:bg-black hover:-translate-y-2 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest mx-auto group">
              Start Free Now <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const WorkStep = ({ icon, title, desc }) => (
  <div className="flex gap-6 group">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-all">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="text-xl font-black text-gray-900 tracking-tight">{title}</h4>
      <p className="text-gray-400 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

const PricingItem = ({ text, active = true }) => (
  <li className="flex items-center gap-3">
    <FaCheckCircle className={active ? 'text-green-500' : 'text-gray-300'} />
    <span className="text-sm font-bold">{text}</span>
  </li>
);

export default Landing;
