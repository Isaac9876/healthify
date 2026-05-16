import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, FaClipboard, FaCheck, FaInfoCircle, 
  FaBox, FaLeaf, FaBreadSlice, FaEgg, FaPepperHot, FaDotCircle,
  FaDownload, FaPrint, FaStore, FaMobileAlt, FaChevronRight, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const categoryIcons = {
  protein: <FaEgg />,
  vegetable: <FaLeaf />,
  starch: <FaBreadSlice />,
  dairy: <FaDotCircle />,
  spice: <FaPepperHot />,
  other: <FaBox />
};

const ActionButton = ({ onClick, icon, title }) => (
  <button 
    onClick={onClick}
    className="bg-white/10 hover:bg-white text-white hover:text-gray-900 w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-white/10 shadow-sm"
    title={title}
  >
    {icon}
  </button>
);

const CategoryCard = ({ cat, items, delay, checkedItems, onToggle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white rounded-[3.5rem] shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden flex flex-col h-full"
  >
    <div className="p-10 pb-6 flex items-center gap-5 border-b border-gray-50/50">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
        cat === 'protein' ? 'bg-red-50 text-red-600' :
        cat === 'vegetable' ? 'bg-green-50 text-green-600' :
        cat === 'starch' ? 'bg-amber-50 text-amber-600' :
        cat === 'dairy' ? 'bg-blue-50 text-blue-600' :
        cat === 'spice' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-600'
      }`}>
        {categoryIcons[cat] || <FaBox />}
      </div>
      <div>
        <h3 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{cat}</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{items.length} Items</p>
      </div>
    </div>
    
    <div className="p-6 space-y-3 flex-grow">
      {[...items].sort((a, b) => (checkedItems[a.name] ? 1 : -1)).map((item, i) => (
        <button
          key={i}
          onClick={() => onToggle(item.name)}
          className={`w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group ${
            checkedItems[item.name] ? 'bg-gray-50 opacity-50 grayscale' : 'bg-white hover:bg-gray-50/50'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
              checkedItems[item.name] ? 'bg-green-600 border-green-600' : 'border-gray-100 bg-gray-50 group-hover:border-green-200'
            }`}>
              {checkedItems[item.name] && <FaCheck className="text-white text-[10px]" />}
            </div>
            <div className="text-left">
              <span className={`text-lg font-black tracking-tight text-gray-800 ${checkedItems[item.name] ? 'line-through' : ''}`}>
                {item.name}
              </span>
            </div>
          </div>
          <div className="bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-xl text-xs font-black text-gray-500 whitespace-nowrap">
            {item.qty} <span className="text-[10px] opacity-60 ml-0.5">{item.unit}</span>
          </div>
        </button>
      ))}
    </div>
  </motion.div>
);

const GroceryList = () => {
  const [checkedItems, setCheckedItems] = useState({});
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['groceryList', auth.currentUser?.uid],
    queryFn: async () => {
      const res = await api.get(`/meals/grocery/week?userId=${auth.currentUser.uid}`);
      return res.data;
    },
    enabled: !!auth.currentUser,
    staleTime: 1000 * 60 * 30,
  });

  const toggleItem = (name) => {
    setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const copyToClipboard = () => {
    if (!data?.items_by_category) return;
    let text = "My Grocery List - HealthMate\n\n";
    Object.entries(data.items_by_category).forEach(([cat, items]) => {
      text += `${cat.toUpperCase()}:\n`;
      items.forEach(item => {
        text += `- ${item.name} (${item.qty} ${item.unit})\n`;
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text);
    alert("Grocery list copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (isError || !data || data.meals_included === 0) return (
    <div className="container mx-auto px-6 py-20 text-center">
      <div className="bg-white rounded-[4rem] p-16 shadow-2xl border border-gray-100 max-w-2xl mx-auto overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-600" />
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <FaShoppingCart className="text-gray-200 text-4xl" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Your cart is empty.</h2>
        <p className="text-gray-500 mb-10 text-xl leading-relaxed">Please plan your meals first to see your shopping list here.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-900 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95 text-lg"
        >
          Plan Your Week
        </button>
      </div>
    </div>
  );

  const totalItems = data?.items_by_category ? Object.values(data.items_by_category).flat().length : 0;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="bg-white min-h-screen pb-32 font-sans print:p-0 print:bg-white">
      <header className="pt-20 pb-40 bg-gray-50/50 border-b border-gray-100 relative overflow-hidden print:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-green-600 hover:shadow-lg transition-all">
                  <FaArrowLeft size={12} />
                </button>
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Weekly Shopping List</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">
                My <span className="text-green-600">Groceries</span>.
              </h1>
              <p className="text-gray-400 text-xl font-medium max-w-lg leading-tight">
                Everything you need to buy for your meals this week.
              </p>
            </div>

            <div className="flex flex-col gap-6 min-w-[380px]">
              {/* Progress Bar */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shopping Progress</span>
                  <span className="text-xs font-black text-green-600">{progress}% Done</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-green-600"
                  />
                </div>
                <p className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{checkedCount} of {totalItems} items collected</p>
              </div>

              <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Estimated Cost</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{data.total_cost_ghs}</span>
                    <span className="text-xs opacity-50 font-bold uppercase ml-1">GHS</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ActionButton onClick={copyToClipboard} icon={<FaClipboard size={14} />} title="Copy" />
                  <ActionButton onClick={handlePrint} icon={<FaPrint size={14} />} title="Print" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 -mt-16 relative z-10 print:mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {Object.entries(data.items_by_category).map(([cat, items], idx) => (
              <CategoryCard 
                key={cat} 
                cat={cat} 
                items={items} 
                delay={idx * 0.05} 
                checkedItems={checkedItems}
                onToggle={toggleItem}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      <footer className="hidden print:block mt-20 border-t pt-10 text-center text-gray-400 text-sm font-bold">
        <p>Generated by HealthMate AI - Your Personal Nutritionist</p>
      </footer>
    </div>
  );
};

export default GroceryList;
