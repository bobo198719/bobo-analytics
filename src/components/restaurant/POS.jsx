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
  AlertTriangle,
  X
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
  const [showReceipt, setShowReceipt] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
      name: 'Bobo OS',
      address: 'Cloud Matrix HQ',
      contact: '+91 999 000 1111',
      gst: '07AAAAA0000A1Z5'
  });

  useEffect(() => {
    const savedTable = localStorage.getItem('selected_table_id');
    const savedTableNum = localStorage.getItem('selected_table_number');
    if (savedTable) setSelectedTable(savedTable);
    if (savedTableNum) setSelectedTableNum(savedTableNum);

    // Sync Restaurant Identity
    const savedIdentity = localStorage.getItem('restaurant_identity');
    if (savedIdentity) {
        try {
            const data = JSON.parse(savedIdentity);
            setRestaurantData(prev => ({...prev, ...data}));
        } catch(e) {}
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const getImageUrl = (item) => {
    if (item.image_url && item.image_url.startsWith('http')) return item.image_url;
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
      if (!menuRes.ok || !tablesRes.ok) throw new Error(`LINK_SYNC_FAILURE: ${menuRes.status} | ${tablesRes.status}`);
      const menuData = await menuRes.json();
      const tablesData = await tablesRes.json();
      const sorted = [...menuData].sort((a, b) => b.id - a.id).slice(0, 253);
      setItems(sorted);
      setTables(tablesData);
      setCategories(['All', ...new Set(sorted.map(item => item.category))]);
      setLoading(false);
      setError(null);
    } catch (err) {
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
    } catch (err) { alert("TERMINAL OFFLINE"); }
    finally { setIsSubmitting(false); }
  };

  const handlePrint = () => {
    if (cart.length === 0) return alert("ACTIVE BASKET EMPTY");
    setShowReceipt(true);
  };

  const triggerActualPrint = () => {
    window.print();
  };

  // ── THERMAL RECEIPT MODAL ─────────────────────────
  const ReceiptPreview = () => (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-white text-black p-8 rounded-sm shadow-2xl w-[350px] max-h-[90vh] overflow-y-auto flex flex-col font-mono relative printer-area">
            <button onClick={() => setShowReceipt(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black no-print"><X/></button>
            
            <div className="text-center mb-6 space-y-1">
                <h1 className="text-xl font-black uppercase tracking-tighter">{restaurantData.name}</h1>
                <p className="text-[10px] uppercase font-bold text-gray-600">{restaurantData.address}</p>
                <p className="text-[10px] uppercase font-bold text-gray-600">Tel: {restaurantData.contact}</p>
                <p className="text-[10px] uppercase font-bold text-gray-600">GST: {restaurantData.gst}</p>
                <div className="border-b-2 border-dashed border-black pt-4"></div>
            </div>

            <div className="text-[10px] font-bold uppercase mb-4 space-y-1">
                <div className="flex justify-between"><span>Date:</span><span>{new Date().toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span>Time:</span><span>{new Date().toLocaleTimeString()}</span></div>
                <div className="flex justify-between"><span>Table:</span><span>{selectedTableNum || 'POS-DIRECT'}</span></div>
                <div className="border-b border-black pt-2"></div>
            </div>

            <div className="flex-1 space-y-2 mb-6">
                <div className="flex justify-between text-[10px] font-black border-b border-black pb-1">
                    <span className="w-8">QTY</span>
                    <span className="flex-1 text-left px-2">ITEM</span>
                    <span className="w-16 text-right">TOTAL</span>
                </div>
                {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10px] font-bold leading-tight">
                        <span className="w-8">{item.quantity}</span>
                        <span className="flex-1 px-2 uppercase">{item.name}</span>
                        <span className="w-16 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="border-b-2 border-dashed border-black pt-4"></div>
            </div>

            <div className="space-y-1 text-[10px] font-bold">
                <div className="flex justify-between"><span>Subtotal:</span><span>₹{getSubtotal().toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax (GST 5%):</span><span>₹{getGST().toFixed(2)}</span></div>
                <div className="flex justify-between border-t border-black pt-2 text-sm font-black italic">
                    <span>AGGR. TOTAL:</span>
                    <span>₹{getTotal().toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <p className="text-[9px] font-black italic uppercase">Thank You for Visiting!</p>
                <div className="w-16 h-16 bg-gray-100 mx-auto rounded-md flex items-center justify-center border border-gray-200">
                    <Zap className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-[8px] font-bold text-gray-400 mt-2">Matrix Protocol V3.5</p>
            </div>

            <button onClick={triggerActualPrint} className="mt-8 w-full bg-black text-white py-4 rounded-xl font-black uppercase text-[10px] no-print active:scale-95 transition-all">Print Receipt →</button>
        </div>

        <style>{`
            @media print {
                body * { visibility: hidden; }
                .printer-area, .printer-area * { visibility: visible; }
                .printer-area { 
                    position: absolute !important; 
                    left: 0 !important; 
                    top: 0 !important; 
                    width: 80mm !important; 
                    padding: 4mm !important;
                    margin: 0 !important;
                }
                .no-print { display: none !important; }
            }
        `}</style>
    </div>
  );

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-10 bg-white/5 border border-white/10 rounded-[48px] p-20 text-center animate-in fade-in duration-500">
         <div className="w-24 h-24 bg-rose-600/20 rounded-full flex items-center justify-center text-rose-500 animate-pulse border border-rose-600/30">
            <AlertTriangle className="w-12 h-12" />
         </div>
         <div className="space-y-4">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">POS <span className="text-rose-500">Matrix Synced</span></h2>
            <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.4em] italic leading-relaxed">System: {error}</p>
         </div>
         <button onClick={() => { setLoading(true); fetchData(); }} className="px-10 py-5 bg-white text-black rounded-2xl font-black italic uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all">Force Re-Sync Matrix</button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-10 animate-in fade-in duration-500 font-['Plus_Jakarta_Sans']">
      
      {showReceipt && <ReceiptPreview />}

      <div className="flex-[1.8] flex flex-col gap-8 min-w-0">
        <header className="flex items-center justify-between gap-6">
           <div className="relative flex-1 group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-orange-500 transition-colors w-4 h-4" />
             <input type="text" placeholder="QUERY MENU MATRIX..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-white/10 focus:border-orange-500 transition-all outline-none text-white" />
           </div>
           <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black uppercase text-white/50 tracking-widest italic">Terminal Live</span>
           </div>
        </header>

        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat, i) => (
            <button key={i} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-2xl whitespace-nowrap font-black uppercase tracking-[0.2em] text-[8px] italic transition-all border ${activeCategory === cat ? 'bg-orange-600 border-orange-400 text-white shadow-xl shadow-orange-600/30' : 'bg-white/5 text-white/30 border-white/10 hover:bg-white/10'}`} > {cat} </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {loading ? (
             Array.from({length: 6}).map((_, i) => ( <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[40px] h-64 animate-pulse"></div> ))
          ) : items.filter(it => (activeCategory === 'All' || it.category === activeCategory) && (searchTerm === '' || it.name.toLowerCase().includes(searchTerm.toLowerCase())))
            .map((item) => (
            <div key={item.id} onClick={() => addToCart(item)} className="group bg-white/10 border border-white/20 p-8 rounded-[40px] cursor-pointer hover:bg-white/[0.15] hover:border-orange-500/50 transition-all relative overflow-hidden active:scale-95 shadow-2xl flex flex-col min-h-[320px]" >
              <div className="aspect-square w-full bg-[#05081a] rounded-3xl mb-8 overflow-hidden relative group-hover:scale-[1.05] transition-transform border border-white/5">
                <img src={getImageUrl(item)} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm p-2 text-center pointer-events-none"> <p className="text-[7px] font-black uppercase text-white/85 italic tracking-tighter truncate">{item.name}</p> </div>
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/30 to-transparent p-3 flex justify-end pointer-events-none">
                    <span className={`text-[6px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg border backdrop-blur-md ${item.type === 'veg' ? 'bg-emerald-500/30 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/30 text-rose-400 border-rose-500/40'}`}> {item.type} </span>
                </div>
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                 <h4 className="text-lg font-black text-white italic uppercase tracking-tight mb-2 leading-tight drop-shadow-lg truncate">{item.name}</h4>
                 <div className="flex items-center justify-between mt-auto">
                    <p className="text-2xl font-black italic text-orange-400 tracking-tighter drop-shadow-md">₹{item.price}</p>
                    <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30 opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 shrink-0"> <Plus className="w-6 h-6 text-white" /> </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="w-[400px] bg-white/5 border border-white/10 rounded-[56px] p-10 flex flex-col hover:border-white/20 transition-all shadow-[0_0_100px_rgba(0,0,0,0.4)] backdrop-blur-2xl overflow-hidden group">
          <header className="flex items-center justify-between mb-8 flex-shrink-0">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20"><ShoppingCart className="w-6 h-6" /></div>
                 <div>
                    <h3 className="text-xl font-black italic tracking-tighter">Active Basket</h3>
                    <select className="bg-orange-500/10 border border-orange-500/20 rounded-md text-[10px] font-black text-orange-400 outline-none px-3 py-1.5 cursor-pointer lowercase italic mt-1" value={selectedTable || ''} onChange={(e) => {
                           const newTableId = e.target.value;
                           setSelectedTable(newTableId);
                           localStorage.setItem('selected_table_id', newTableId);
                           const t = tables.find(t => String(t.id) === newTableId);
                           if (t) { setSelectedTableNum(t.table_number); localStorage.setItem('selected_table_number', t.table_number); }
                        }} >
                        <option value="">Matrix Target</option>
                        {tables.map(t => ( <option key={t.id} value={t.id} className="bg-[#05081a]">Element {t.table_number} ({t.status})</option> ))}
                    </select>
                 </div>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 mb-4">
             {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-10">
                    <Table className="w-20 h-20 mb-8" />
                    <p className="font-black text-2xl italic uppercase tracking-[0.2em]">Queue Static</p>
                </div>
             ) : (
                cart.map((item, i) => (
                  <div key={i} className="flex flex-col gap-5 p-6 bg-white/5 border border-white/10 rounded-[40px] hover:bg-white/[0.08] transition-all min-h-[140px] relative overflow-hidden group/item">
                     <div className="flex-1 min-w-0 pr-10">
                        <p className="text-sm font-black italic uppercase tracking-tight text-white pr-2 leading-tight mb-1" title={item.name}>{item.name}</p>
                        <p className="text-[9px] text-white/30 font-black italic uppercase tracking-widest">Yield: ₹{item.price}</p>
                     </div>
                     
                     <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center bg-black/40 rounded-2xl border border-white/5 p-1 px-4 gap-5 font-black transition-all">
                           <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center text-xl text-white/30 hover:text-rose-500">-</button>
                           <span className="text-xs font-black italic text-orange-400">{item.quantity}</span>
                           <button onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center text-xl text-white/30 hover:text-emerald-500">+</button>
                        </div>
                        <p className="text-base font-black italic text-white/90">₹{(item.price * item.quantity).toFixed(2)}</p>
                     </div>

                     <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="absolute top-6 right-6 p-2 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover/item:opacity-100 hover:bg-rose-500 hover:text-white transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
                ))
             )}
          </div>

          <div className="pt-6 border-t border-white/5 space-y-6 flex-shrink-0">
             <div className="space-y-3">
                <div className="flex items-center justify-between text-white/20 font-black text-[10px] tracking-widest uppercase italic border-b border-white/5 pb-3"> <span>Operational Subtotal</span> <span>₹{getSubtotal().toFixed(2)}</span> </div>
                <div className="flex items-center justify-between text-white/20 font-black text-[10px] tracking-widest uppercase italic border-b border-white/5 pb-3 pt-3"> <span>Tax (GST @ 5.0%)</span> <span>₹{getGST().toFixed(2)}</span> </div>
                <div className="flex items-center justify-between pt-4">
                   <div>
                      <span className="text-[8px] font-black uppercase text-white/30 tracking-widest italic block">AGGREGATE DUES (INC. GST)</span>
                      <span className="text-3xl font-black italic tracking-tighter text-orange-400">₹{getTotal().toFixed(2)}</span>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={handlePrint} className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/30 hover:bg-white/10 transition-all text-white"><Printer size={20}/></button>
                   </div>
                </div>
             </div>
             <button onClick={handlePlaceOrder} disabled={cart.length === 0 || isSubmitting} className={`w-full py-6 bg-orange-600 rounded-[32px] font-black italic uppercase tracking-[0.3em] text-xs shadow-2xl flex items-center justify-center gap-4 transition-all ${isSubmitting ? 'opacity-50' : 'shadow-orange-600/30 hover:scale-[1.02]'}`} >
               {isSubmitting ? 'Syncing...' : ( <div className="flex items-center gap-2 text-white">Commit Matrix Payload <SendHorizonal size={16} /></div> )}
             </button>
          </div>
      </aside>
    </div>
  );
};

export default POS;
