import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  CheckCircle, 
  Printer, 
  SendHorizonal,
  Search,
  ChevronRight,
  Filter
} from 'lucide-react';

const POS = () => {
  const [categories, setCategories] = useState(['All', 'Starters', 'Main Course', 'Beverages', 'Desserts']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([
    { id: 1, name: 'Paneer Tikka', price: 280, type: 'veg', category: 'Starters' },
    { id: 2, name: 'Butter Chicken', price: 450, type: 'non-veg', category: 'Main Course' },
    { id: 3, name: 'Fresh Lime Soda', price: 90, type: 'veg', category: 'Beverages' },
    { id: 4, name: 'Mutton Biryani', price: 580, type: 'non-veg', category: 'Main Course' },
    { id: 5, name: 'Gulab Jamun', price: 120, type: 'veg', category: 'Desserts' },
    { id: 6, name: 'Tandoori Roti', price: 20, type: 'veg', category: 'Main Course' }
  ]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existing = cart.find(c => c.id === itemId);
    if (existing.quantity === 1) {
      setCart(cart.filter(c => c.id !== itemId));
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const getSubtotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const getGST = () => getSubtotal() * 0.05; // 5% GST
  const getTotal = () => getSubtotal() + getGST();

  const handlePlaceOrder = async () => {
    setLoading(true);
    // Mimic API Call
    setTimeout(() => {
       alert("Order Placed Successfully!");
       setCart([]);
       setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-10">
      {/* Menu Area */}
      <div className="flex-1 flex flex-col gap-10">
        <header className="flex items-center justify-between gap-6">
           <div className="relative flex-1 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5 group-focus-within:text-bobo-accent transition-colors" />
             <input 
               type="text" 
               placeholder="Search Menu Intelligence..." 
               className="w-full bg-white/5 border border-white/10 p-4 pl-14 rounded-3xl text-sm font-bold placeholder:text-white/20 focus:border-bobo-accent focus:bg-white/[0.08] transition-all outline-none"
             />
           </div>
           <div className="flex gap-2">
              <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"><Filter className="w-5 h-5" /></button>
           </div>
        </header>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-2xl whitespace-nowrap font-black uppercase tracking-widest text-[10px] transition-all ${activeCategory === cat ? 'bg-bobo-accent text-white shadow-lg shadow-bobo-accent/20' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.filter(it => activeCategory === 'All' || it.category === activeCategory).map((item, i) => (
            <div 
              key={i}
              onClick={() => addToCart(item)}
              className="group bg-white/5 border border-white/10 p-6 rounded-3xl cursor-pointer hover:border-bobo-accent transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">{item.type === 'veg' ? '🥗' : '🍗'}</div>
                 <div className={`p-1 px-3 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 ${item.type === 'veg' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{item.type}</div>
              </div>
              <h4 className="text-xl font-black mb-1 group-hover:text-white transition-colors">{item.name}</h4>
              <p className="text-white/50 font-black text-sm uppercase tracking-tight">₹{item.price}</p>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-bobo-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-bobo-accent/20 transition-all"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Area */}
      <aside className="w-[440px] bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-2xl">
        <div className="flex flex-col h-full overflow-hidden">
          <header className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-bobo-accent/10 rounded-2xl flex items-center justify-center text-bobo-accent"><ShoppingCart /></div>
               <div>
                  <h3 className="text-xl font-black">Active Cart</h3>
                  <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Table 05</p>
               </div>
             </div>
             <button onClick={() => setCart([])} className="text-white/30 hover:text-rose-400 font-bold transition-colors">Clear</button>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
             {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-20 translate-y-20">
                   <div className="w-24 h-24 border-4 border-dashed border-white rounded-full flex items-center justify-center mb-6"><ShoppingCart className="w-10 h-10" /></div>
                   <p className="font-black text-xl uppercase tracking-widest">Cart is empty</p>
                   <p className="text-sm">Select items to begin billing</p>
                </div>
             ) : (
                cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-5">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 group-hover:border-bobo-accent transition-all"><Plus className="w-4 h-4" /></div>
                        <div>
                           <p className="text-md font-black italic tracking-tight">{item.name}</p>
                           <p className="text-xs text-white/40">₹{item.price} per unit</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1 px-4 gap-6 font-black scale-90 group-hover:scale-100 transition-all">
                           <button onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-white transition-colors">-</button>
                           <span className="text-sm">{item.quantity}</span>
                           <button onClick={() => addToCart(item)} className="text-white/30 hover:text-white transition-colors">+</button>
                        </div>
                        <p className="text-sm font-black w-20 text-right">₹{item.price * item.quantity}</p>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-white/5 space-y-8">
           <div className="space-y-4">
              <div className="flex items-center justify-between text-white/40 font-bold text-sm tracking-widest uppercase italic">
                 <span>Subtotal</span>
                 <span>₹{getSubtotal()}</span>
              </div>
              <div className="flex items-center justify-between text-white/40 font-bold text-sm tracking-widest uppercase italic">
                 <span>GST (5%)</span>
                 <span>₹{getGST().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-2xl font-black italic">
                 <span>Total Payable</span>
                 <span className="text-bobo-accent">₹{getTotal().toFixed(2)}</span>
              </div>
           </div>

           <div className="flex gap-4">
              <button disabled={cart.length === 0} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all text-white/50"><Printer /></button>
              <button 
                onClick={handlePlaceOrder}
                disabled={cart.length === 0 || loading} 
                className={`flex-1 flex items-center justify-center gap-4 bg-bobo-accent rounded-3xl font-black italic text-xl shadow-2xl transition-all shadow-bobo-accent/30 ${loading ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02] active:scale-95'}`}
              >
                {loading ? 'Processing...' : (
                  <>
                     Place KOT
                     <SendHorizonal />
                  </>
                )}
              </button>
           </div>
        </div>
      </aside>
    </div>
  );
};

export default POS;
