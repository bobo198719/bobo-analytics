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
  Filter,
  Zap,
  Trash2,
  Table,
  AlertTriangle
} from 'lucide-react';

const POS = () => {
  const [categories, setCategories] = useState(['All', 'Starters', 'Main Course', 'Beverages', 'Desserts']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableNum, setSelectedTableNum] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phase 1: SSR Safe Persistence
  useEffect(() => {
    const savedTable = localStorage.getItem('selected_table_id');
    const savedTableNum = localStorage.getItem('selected_table_number');
    if (savedTable) setSelectedTable(savedTable);
    if (savedTableNum) setSelectedTableNum(savedTableNum);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Each dish has its own unique photo from the DB. Trust it completely.
  const getImageUrl = (item) => {
    // 🛡️ Phase 1: V39 - CLOUD IMAGE SHIELD
    if (item.image_url && item.image_url.startsWith('http')) return item.image_url;
    
    // Automatic Substitution for broken Hostinger local paths
    const fallbacks = {
      'Starters': 'https://images.unsplash.com/photo-1567188040759-fbcd18884932?auto=format&fit=crop&q=80&w=400',
      'Main Course': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400',
      'Beverages': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=400',
      'Desserts': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=400',
    };
    return fallbacks[item.category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
  };

  const fetchData = async () => {
    try {
      const [menuRes, tablesRes] = await Promise.all([
        fetch('/api/v2/restaurant/menu'),
        fetch('/api/v2/restaurant/tables')
      ]);
      
      if (!menuRes.ok || !tablesRes.ok) {
        throw new Error(`LINK_SYNC_FAILURE: ${menuRes.status} | ${tablesRes.status}`);
      }

      const menuData = await menuRes.json();
      const tablesData = await tablesRes.json();
      
      if (!Array.isArray(menuData)) throw new Error("Catalog Stream Corrupted");
      
      // Sort by newest ID = our curated unique dishes appear first
      const sorted = [...menuData].sort((a, b) => b.id - a.id).slice(0, 253);
      
      setItems(sorted);
      setTables(tablesData);
      
      const cats = ['All', ...new Set(sorted.map(item => item.category))];
      setCategories(cats);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("POS Data Fetch Fail:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

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
    if (!existing) return;
    if (existing.quantity === 1) {
      setCart(cart.filter(c => c.id !== itemId));
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const getSubtotal = () => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const getGST = () => getSubtotal() * 0.05;
  const getTotal = () => getSubtotal() + getGST();

  const handlePlaceOrder = async () => {
    if (!selectedTable) return alert("SELECT TABLE FOR COMMIT");
    if (cart.length === 0) return alert("CART EMPTY");
    
    setIsSubmitting(true);
    try {
        const res = await fetch('/api/v2/restaurant/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table_id: selectedTable,
                items: cart.map(i => ({ menu_item_id: i.id, quantity: i.quantity }))
            })
        });
        
        if (res.ok) {
            alert(`Order Committed for Table ${selectedTableNum}`);
            setCart([]);
            setSelectedTable(null);
            fetchData();
        } else {
            const result = await res.json();
            alert("COMMIT FAILURE: " + (result.error || "Server issue"));
        }
    } catch (err) { 
        alert("TERMINAL OFFLINE");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-10 bg-white/5 border border-white/10 rounded-[48px] p-20 text-center animate-in fade-in duration-500">
         <div className="text-gray-500 mb-2 font-mono text-[10px] tracking-widest opacity-30">INFRASTRUCTURE_SYNC_IDENTITY: V40_ACTIVE</div>
         <div className="w-24 h-24 bg-rose-600/20 rounded-full flex items-center justify-center text-rose-500 animate-pulse border border-rose-600/30">
            <AlertTriangle className="w-12 h-12" />
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">POS <span className="text-rose-500">Matrix Synced</span></h2>
            <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.4em] italic leading-relaxed">System: {error}<br/>Cloud Bridge: V40_DIRECT</p>
         </div>
         <button onClick={() => { setLoading(true); fetchData(); }} className="px-10 py-5 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all">Force Re-Sync Matrix</button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-10 animate-in fade-in duration-500 font-['Plus_Jakarta_Sans']">
      
      <div className="flex-[1.8] flex flex-col gap-8 min-w-0">
        <header className="flex items-center justify-between gap-6">
           <div className="relative flex-1 group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-500 transition-colors w-4 h-4" />
             <input 
               type="text" 
               placeholder="QUERY MENU MATRIX..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-white/10 focus:border-orange-500 transition-all outline-none text-white"
             />
           </div>
           <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black uppercase text-white/50 tracking-widest italic">Terminal Live</span>
           </div>
        </header>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-2xl whitespace-nowrap font-black uppercase tracking-[0.2em] text-[8px] italic transition-all border ${activeCategory === cat ? 'bg-orange-600 border-orange-400 text-white shadow-xl shadow-orange-600/30' : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {loading ? (
             Array.from({length: 6}).map((_, i) => (
               <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[40px] h-64 animate-pulse"></div>
             ))
          ) : items
            .filter(it => (activeCategory === 'All' || it.category === activeCategory) && (searchTerm === '' || it.name.toLowerCase().includes(searchTerm.toLowerCase())))
            .map((item) => (
            <div 
              key={item.id}
              onClick={() => addToCart(item)}
              className="group bg-white/10 border border-white/20 p-8 rounded-[40px] cursor-pointer hover:bg-white/[0.15] hover:border-orange-500/50 transition-all relative overflow-hidden active:scale-95 shadow-2xl flex flex-col min-h-[320px]"
            >
              <div className="aspect-square w-full bg-[#05081a] rounded-3xl mb-8 overflow-hidden relative group-hover:scale-[1.05] transition-transform border border-white/5">
                <img 
                   src={getImageUrl(item)} 
                   alt={item.name} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                   onError={(e) => {
                     e.target.onerror = null;
                     // Read from alt attribute to avoid stale closure bug
                     const dishName = e.target.getAttribute('alt') || 'Dish';
                     e.target.style.display = 'none';
                     const fb = document.createElement('div');
                     fb.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center;background:linear-gradient(135deg,rgba(234,88,12,0.25),rgba(244,63,94,0.25))';
                     fb.innerHTML = `<p style="font-size:8px;font-weight:900;text-transform:uppercase;color:rgba(255,255,255,0.4);font-style:italic;margin-bottom:6px;">NO IMAGE</p><p style="font-size:10px;font-weight:900;text-transform:uppercase;color:rgba(255,255,255,0.8);font-style:italic;line-height:1.3;word-break:break-word;">${dishName}</p>`;
                     e.target.parentNode.appendChild(fb);
                   }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm p-2 text-center pointer-events-none">
                    <p className="text-[7px] font-black uppercase text-white/85 italic tracking-tighter truncate">{item.name}</p>
                </div>
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/30 to-transparent p-3 flex justify-end pointer-events-none">
                    <span className={`text-[6px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg border backdrop-blur-md ${item.type === 'veg' ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/30 text-rose-400 border-rose-500/40'}`}>
                        {item.type}
                    </span>
                </div>
              </div>
              
              <div className="relative z-10 flex-1 min-w-0">
                 <h4 className="text-lg font-black text-white italic uppercase tracking-tight mb-2 leading-tight drop-shadow-lg truncate">{item.name}</h4>
                 <div className="flex items-center justify-between mt-auto">
                    <p className="text-2xl font-black italic text-orange-400 tracking-tighter drop-shadow-md">₹{item.price}</p>
                    <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30 opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 shrink-0">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="flex-1 bg-white/5 border border-white/10 rounded-[56px] p-10 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_0_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl min-w-[380px] overflow-hidden group">
        <div className="flex flex-col h-full overflow-hidden relative z-10">
          <header className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20"><ShoppingCart className="w-6 h-6" /></div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-xl font-black italic tracking-tighter">Active Basket</h3>
                       <select 
                         className="bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] font-black text-orange-400 outline-none px-3 py-1.5 cursor-pointer lowercase italic"
                         value={selectedTable || ''}
                         onChange={(e) => {
                           const newTableId = e.target.value;
                           setSelectedTable(newTableId);
                           localStorage.setItem('selected_table_id', newTableId);
                           const t = tables.find(t => t.id === newTableId);
                           if (t) {
                                setSelectedTableNum(t.table_number);
                                localStorage.setItem('selected_table_number', t.table_number);
                           }
                         }}
                       >
                          <option value="">Matrix Target</option>
                          {tables.map(t => (
                            <option key={t.id} value={t.id} className="bg-[#05081a]">Element {t.table_number} ({t.status})</option>
                          ))}
                       </select>
                    </div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic mt-1">Terminal Persistence Active</p>
                 </div>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
             {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-10">
                    <Table className="w-20 h-20 mb-8" />
                    <p className="font-black text-2xl italic uppercase tracking-[0.2em]">Queue Static</p>
                </div>
             ) : (
                cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/[0.08] transition-all">
                     <div className="flex-1">
                        <p className="text-xs font-black italic uppercase tracking-tight">{item.name}</p>
                        <p className="text-[8px] text-white/20 font-black italic mt-1 uppercase">Unit Yield: ₹{item.price}</p>
                     </div>
                     <div className="flex items-center gap-6 ml-6">
                        <div className="flex items-center bg-black/40 rounded-2xl border border-white/5 p-1 px-3 gap-3 font-black transition-all">
                           <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 flex items-center justify-center text-lg text-white/20 hover:text-rose-500">-</button>
                           <span className="text-xs font-black italic text-orange-400">{item.quantity}</span>
                           <button onClick={() => addToCart(item)} className="w-5 h-5 flex items-center justify-center text-lg text-white/20 hover:text-emerald-500">+</button>
                        </div>
                        <p className="text-[10px] font-black italic w-16 text-right text-white/80">₹{item.price * item.quantity}</p>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-white/5 space-y-6 relative z-10">
           <div className="space-y-3">
              <div className="flex items-center justify-between text-white/20 font-black text-[10px] tracking-widest uppercase italic border-b border-white/5 pb-3">
                 <span>Operational Subtotal</span>
                 <span>₹{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-4">
                 <div>
                    <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic block">AGGREGATE DUES (INC. GST)</span>
                    <span className="text-3xl font-black italic tracking-tighter text-orange-400">₹{getTotal().toFixed(2)}</span>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => window.print()} className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/30 hover:bg-white/10 transition-all text-white"><Printer size={20}/></button>
                 </div>
              </div>
           </div>

           <button 
             onClick={handlePlaceOrder}
             disabled={cart.length === 0 || isSubmitting} 
             className={`w-full py-6 bg-orange-600 rounded-[32px] font-black italic uppercase tracking-[0.3em] text-xs shadow-2xl flex items-center justify-center gap-4 transition-all ${isSubmitting ? 'opacity-50' : 'shadow-orange-600/30 hover:scale-[1.02]'}`}
           >
             {isSubmitting ? 'Syncing...' : (
               <div className="flex items-center gap-2 text-white">Commit Matrix Payload <SendHorizonal size={16} /></div>
             )}
           </button>
        </div>
      </aside>
    </div>
  );
};

export default POS;
