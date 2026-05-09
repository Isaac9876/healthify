import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, FaClipboard, FaCheck, FaInfoCircle, 
  FaBox, FaLeaf, FaBreadSlice, FaEgg, FaPepperHot, FaDotCircle,
  FaDownload, FaPrint, FaStore, FaMobileAlt, FaChevronRight
} from 'react-icons/fa';

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
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{items.length} Essential Items</p>
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
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">In Season</p>
            </div>
          </div>
          <div className="bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-xl text-xs font-black text-gray-500 whitespace-nowrap">
            {item.qty} <span className="text-[10px] opacity-60 ml-0.5">{item.unit}</span>
          </div>
        </button>
      ))}
    </div>
    
    <div className="p-6 bg-gray-50/30 border-t border-gray-50/50 text-center">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End of Section</span>
    </div>
  </motion.div>
);

const GroceryList = () => {
  const [checkedItems, setCheckedItems] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'focus'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['groceryList', auth.currentUser?.uid],
    queryFn: async () => {
      const res = await api.get(`/meals/grocery/week?userId=${auth.currentUser.uid}`);
      return res.data;
    },
    enabled: !!auth.currentUser
  });

  const toggleItem = (name) => {
    setCheckedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const copyToClipboard = () => {
    if (!data?.items_by_category) return;
    let text = "My Grocery List - Healthify\n\n";
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
        <p className="text-gray-500 mb-10 text-xl leading-relaxed">We couldn't find any active meal plans for this week. Start planning to generate your intelligent grocery list.</p>
        <button 
          onClick={() => window.location.href = '/'} 
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
      {/* Professional Header */}
      <header className="pt-20 pb-32 bg-gray-50/50 border-b border-gray-100 print:hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-4">
                <span className="w-10 h-[2px] bg-green-600" />
                <span className="text-green-600 font-black uppercase tracking-[0.3em] text-[10px]">Smart Inventory</span>
              </motion.div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">Grocery <span className="text-green-600">Concierge</span>.</h1>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <FaStore className="text-green-600" />
                  <span>{data.meals_included} Meals Optimized</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <FaMobileAlt className="text-blue-500" />
                  <span>Ready for Market</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col gap-4">
              <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200 flex items-center justify-between min-w-[320px]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Estimated Spend</p>
                  <p className="text-4xl font-black text-white">{data.total_cost_ghs} <span className="text-sm font-normal opacity-50 uppercase">ghs</span></p>
                </div>
                <div className="flex gap-2">
                  <ActionButton onClick={copyToClipboard} icon={<FaClipboard />} title="Copy" />
                  <ActionButton onClick={handlePrint} icon={<FaPrint />} title="Print" />
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shopping Progress</span>
                  <span className="text-sm font-black text-green-600">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-green-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Grocery Grid */}
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

      {/* Floating Focus Mode Button (Mobile Only) */}
      <button 
        className="md:hidden fixed bottom-8 right-6 bg-gray-900 text-white p-6 rounded-full shadow-2xl z-50 flex items-center gap-3 active:scale-95 transition-all print:hidden"
        onClick={() => setViewMode(viewMode === 'grid' ? 'focus' : 'grid')}
      >
        <FaMobileAlt />
        <span className="font-black text-sm uppercase tracking-widest">Store Mode</span>
      </button>

      {/* Print-only Footer */}
      <footer className="hidden print:block mt-20 border-t pt-10 text-center text-gray-400 text-sm font-bold">
        <p>Generated by Healthify AI - Your Personal Nutritionist</p>
      </footer>
    </div>
  );
};

export default GroceryList;
