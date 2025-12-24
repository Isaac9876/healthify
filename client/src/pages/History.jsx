import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const History = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const res = await api.get(`/meals/${currentUser.uid}`);
          setMeals(res.data);
        } catch (err) {
          console.error("Error fetching history:", err);
        }
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Meal History</h1>
      {meals.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-12 rounded-lg shadow">
          <p>No history found. Start generating meal plans!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {meals.map((plan, index) => (
            <motion.div 
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white shadow-lg rounded-xl overflow-hidden"
            >
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-700">{new Date(plan.date).toDateString()}</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plan.meals.map((meal, idx) => (
                  <div key={idx} className="border border-gray-100 p-4 rounded-lg hover:bg-green-50 transition duration-300">
                    <p className="font-semibold text-xs text-green-600 uppercase tracking-wider mb-1">{meal.type}</p>
                    <p className="font-bold text-gray-800 mb-2">{meal.name}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{meal.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
