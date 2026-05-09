import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaLeaf, FaCheckCircle, FaStar, FaQuoteLeft, FaArrowRight, 
  FaCalendarCheck, FaChartBar, FaUtensils 
} from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-52 overflow-hidden">
        {/* Minimalist Background Subtle Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-gray-600 text-xs font-black uppercase tracking-widest mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              Revolutionizing Healthy Living
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl lg:text-8xl font-black text-gray-900 leading-[0.95] tracking-tight mb-10"
            >
              Nutrition, <br/>
              <span className="text-green-600">Perfected.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-xl lg:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Get personalized meal plans tailored to your body and goals. No more guesswork—just delicious, effective nutrition.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-6"
            >
              <Link 
                to="/login" 
                className="bg-gray-900 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-gray-200 transition-all hover:bg-gray-800 active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                Start Your Journey <FaArrowRight size={14} />
              </Link>
              <a 
                href="#how-it-works" 
                className="bg-white border-2 border-gray-100 text-gray-900 font-black py-5 px-12 rounded-[2rem] transition-all hover:border-green-200 hover:bg-green-50/30 flex items-center justify-center text-lg"
              >
                Learn More
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Dashboard Preview */}
      <section className="pb-32 px-6">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative max-w-6xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <img 
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop" 
              alt="Dashboard Preview"
              className="w-full h-auto object-cover"
            />
            {/* Floating Stats */}
            <div className="absolute bottom-10 left-10 right-10 flex flex-wrap justify-center gap-6">
              <StatBadge label="1,200+" sub="Meal Variations" />
              <StatBadge label="98%" sub="User Satisfaction" />
              <StatBadge label="10k+" sub="Goals Achieved" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simplified Features */}
      <section id="how-it-works" className="py-32 bg-gray-50/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16">
            <Feature 
              icon={<FaCalendarCheck className="text-3xl" />}
              title="Tailored Planning"
              desc="Daily meal plans generated specifically for your metabolism and health goals."
            />
            <Feature 
              icon={<FaUtensils className="text-3xl" />}
              title="Cultural Relevance"
              desc="Enjoy the foods you love with localized recipes that fit your dietary needs."
            />
            <Feature 
              icon={<FaChartBar className="text-3xl" />}
              title="Measurable Progress"
              desc="Track your intake and celebrate every milestone with visual analytics."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-40 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/3">
              <h2 className="text-green-600 font-black uppercase tracking-[0.2em] text-xs mb-6">Testimonials</h2>
              <h3 className="text-5xl font-black text-gray-900 leading-tight mb-8">Loved by the community.</h3>
              <p className="text-xl text-gray-500 leading-relaxed">Join over 1,000 members who have already transformed their nutrition habits.</p>
            </div>
            <div className="lg:w-2/3 grid md:grid-cols-2 gap-8">
              <Testimonial 
                quote="The most professional nutrition tool I've used. It understands my lifestyle and my cravings."
                name="Sarah Johnson"
                role="Fitness Enthusiast"
              />
              <Testimonial 
                quote="Finally, an app that doesn't just count calories but actually plans my meals for me."
                name="David Appiah"
                role="Entrepreneur"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer CTA */}
      <section className="py-32 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-black text-gray-900 mb-12 tracking-tight">Ready to start?</h2>
          <Link 
            to="/login" 
            className="bg-green-600 text-white font-black py-6 px-16 rounded-[2.5rem] shadow-2xl shadow-green-100 hover:bg-green-700 transition-all text-xl inline-block active:scale-95"
          >
            Get Started Free
          </Link>
          <p className="mt-8 text-gray-400 font-bold uppercase tracking-widest text-xs">No credit card required</p>
        </div>
      </section>
    </div>
  );
};

const StatBadge = ({ label, sub }) => (
  <div className="bg-white/90 backdrop-blur-xl px-8 py-4 rounded-3xl shadow-2xl border border-white/50 text-center">
    <p className="text-2xl font-black text-gray-900">{label}</p>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{sub}</p>
  </div>
);

const Feature = ({ icon, title, desc }) => (
  <div className="space-y-6">
    <div className="w-16 h-16 bg-white rounded-3xl shadow-xl shadow-gray-200/50 flex items-center justify-center text-green-600 border border-gray-50">
      {icon}
    </div>
    <h4 className="text-2xl font-black text-gray-900">{title}</h4>
    <p className="text-gray-500 leading-relaxed text-lg">{desc}</p>
  </div>
);

const Testimonial = ({ quote, name, role }) => (
  <div className="bg-gray-50 p-12 rounded-[3rem] border border-gray-100 space-y-8">
    <div className="flex gap-1 text-amber-400">
      {[1,2,3,4,5].map(i => <FaStar key={i} size={14} />)}
    </div>
    <p className="text-2xl font-bold text-gray-900 leading-snug italic">"{quote}"</p>
    <div>
      <p className="font-black text-gray-900">{name}</p>
      <p className="text-sm text-green-600 font-bold uppercase tracking-widest">{role}</p>
    </div>
  </div>
);

export default Landing;
