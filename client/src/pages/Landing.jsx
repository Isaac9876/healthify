import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaRobot, FaHeartbeat, FaArrowRight } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <div 
        className="relative bg-green-600 text-white pt-32 pb-20 px-4 text-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 container mx-auto max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight"
          >
            Eat Smarter, <br/> Live Better.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 opacity-90"
          >
            Personalized meal plans powered by AI, tailored to your unique health goals and taste.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link 
              to="/login" 
              className="bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Your Journey <FaArrowRight />
            </Link>
            <a 
              href="#features" 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-green-800 text-white font-bold py-4 px-10 rounded-full text-lg transition transform hover:scale-105"
            >
              How it Works
            </a>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Healthify?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We combine advanced nutrition science with cutting-edge AI to make healthy eating effortless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              icon={<FaRobot className="text-5xl text-green-500" />}
              title="AI-Powered Planning"
              description="Our Gemini-powered engine creates unique, non-repetitive meal plans based on your specific preferences."
            />
            <FeatureCard 
              image="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              icon={<FaLeaf className="text-5xl text-teal-500" />}
              title="Nutritionally Balanced"
              description="Every meal is calculated to meet your caloric and macronutrient needs for optimal health."
            />
            <FeatureCard 
              image="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              icon={<FaHeartbeat className="text-5xl text-red-500" />}
              title="Health Tracking"
              description="Monitor your progress over time and adjust your goals as you improve your lifestyle."
            />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard 
              name="Kwame Mensah"
              role="Software Engineer"
              quote="Healthify completely changed how I meal prep. The local Ghanaian dish options are spot on!"
            />
            <TestimonialCard 
              name="Ama Osei"
              role="Banker"
              quote="I never have time to plan meals. Healthify does it for me in seconds. Highly recommended."
            />
            <TestimonialCard 
              name="Kofi Boateng"
              role="Fitness Coach"
              quote="The macro tracking is incredibly accurate. I recommend this to all my clients."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ image, icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col"
  >
    <div className="h-48 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover transition transform hover:scale-110 duration-500" />
    </div>
    <div className="p-8 text-center flex-grow flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </motion.div>
);

const TestimonialCard = ({ name, role, quote }) => (
  <div className="bg-white p-8 rounded-xl shadow-md text-left">
    <p className="text-gray-600 italic mb-4">"{quote}"</p>
    <div>
      <h4 className="font-bold text-gray-800">{name}</h4>
      <span className="text-sm text-green-600">{role}</span>
    </div>
  </div>
);

export default Landing;
