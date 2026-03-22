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
      setItems(menuData);
      setTables(tablesData);
      setCategories(['All', ...new Set(menuData.map(item => item.category))]);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
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
    if (!selectedTable) return alert("SELECT TABLE");
    if (cart.length === 0) return alert("BASKET EMPTY");
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
            alert("Order Dispatched!");
            setCart([]);
            setSelectedTable(null);
            fetchData();
        }
    } catch (err) {}
    setIsSubmitting(false);
  };

  const handlePrint = () => { if (cart.length > 0) setShowReceipt(true); };

  const ReceiptPreview = () => (
    <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white text-black p-10 rounded-sm w-[400px] shadow-2xl relative font-mono text-xs">
            <button onClick={() => setShowReceipt(false)} className="absolute top-4 right-4 text-black"><X/></button>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black uppercase">{restaurantData.name}</h1>
                <p>{restaurantData.address}</p>
                <p>GST: {restaurantData.gst}</p>
            </div>
            <div className="border-b-2 border-dashed border-black my-4"></div>
            {cart.map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                    <span className="flex-1">{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
            <div className="border-b-2 border-dashed border-black my-4"></div>
            <div className="flex justify-between font-bold"><span>Subtotal:</span><span>₹{getSubtotal().toFixed(2)}</span></div>
            <div className="flex justify-between font-bold"><span>Tax (5%):</span><span>₹{getGST().toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-black mt-2"><span>TOTAL:</span><span>₹{getTotal().toFixed(2)}</span></div>
            <button onClick={() => window.print()} className="mt-10 w-full bg-black text-white py-4 font-bold border-none no-print">PRINT RECEIPT</button>
        </div>
        <style>{`@media print { body * { visibility: hidden; } .bg-white, .bg-white * { visibility: visible; position: absolute; left: 0; top: 0; } .no-print { display: none; } }`}</style>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-140px)] gap-10 p-2 overflow-hidden font-['Plus_Jakarta_Sans']">
      {showReceipt && <ReceiptPreview />}

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <header className="flex items-center justify-between gap-6 flex-shrink-0">
           <div className="relative flex-1 group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
             <input type="text" placeholder="QUERY MENU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-3xl text-sm font-bold placeholder:text-white/10 outline-none text-white" />
           </div>
           <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase text-emerald-500 font-mono">Terminal Active</span>
           </div>
        </header>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
          {categories.map((cat, i) => (
             <button key={i} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] italic transition-all border ${activeCategory === cat ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/5 text-white/30 border-white/10'}`}>{cat}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {items.filter(it => (activeCategory === 'All' || it.category === activeCategory) && (searchTerm === '' || it.name.toLowerCase().includes(searchTerm.toLowerCase())))
             .map((item) => (
               <div key={item.id} onClick={() => addToCart(item)} className="bg-white/5 border border-white/10 p-6 rounded-[40px] cursor-pointer hover:border-orange-500/40 transition-all flex flex-col group active:scale-95 h-fit">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-6 border border-white/5">
                     <img src={getImageUrl(item)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h4 className="text-lg font-black uppercase italic leading-tight mb-2 truncate">{item.name}</h4>
                  <div className="flex items-center justify-between mt-auto">
                     <span className="text-2xl font-black text-orange-400">₹{item.price}</span>
                     <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center"><Plus size={20}/></div>
                  </div>
               </div>
           ))}
        </div>
      </div>

      <aside className="w-[450px] bg-white/5 border border-white/10 rounded-[56px] flex flex-col overflow-hidden shadow-2xl">
          <div className="p-10 pb-6 flex items-center gap-6 border-b border-white/5">
             <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20"><ShoppingCart/></div>
             <div>
                <h3 className="text-xl font-black uppercase italic">Basket</h3>
                <select className="bg-white/5 border border-white/10 rounded-lg text-[10px] font-black p-2 mt-2 text-white outline-none w-full" value={selectedTable || ''} onChange={(e) => {
                     const val = e.target.value;
                     setSelectedTable(val);
                     const t = tables.find(x => String(x.id) === val);
                     if(t) setSelectedTableNum(t.table_number);
                }}>
                   <option value="">Select Table</option>
                   {tables.map(t => <option key={t.id} value={t.id} className="bg-[#0b0f1a]">Table {t.table_number}</option>)}
                </select>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar">
             {cart.map(item => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 relative group/item" style={{minHeight: '160px'}}>
                   <div className="flex-1">
                      <h5 className="text-sm font-black uppercase italic leading-tight">{item.name}</h5>
                      <span className="text-[10px] text-white/30 font-bold">₹{item.price} each</span>
                   </div>
                   <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-4">
                      <div className="flex items-center bg-black/40 rounded-xl p-1 px-4 gap-6 font-black border border-white/5">
                        <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-rose-500 text-xl">-</button>
                        <span className="text-orange-400">{item.quantity}</span>
                        <button onClick={() => addToCart(item)} className="text-white/20 hover:text-emerald-500 text-xl">+</button>
                      </div>
                      <span className="text-lg font-black italic">₹{(item.price * item.quantity).toFixed(2)}</span>
                   </div>
                   <button onClick={() => setCart(cart.filter(x => x.id !== item.id))} className="absolute top-6 right-6 text-rose-500/40 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                </div>
             ))}
          </div>

          <div className="p-10 pt-0">
             <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-4">
                <div className="flex justify-between text-[10px] font-black text-white/30 uppercase border-b border-white/5 pb-2"><span>Subtotal</span><span>₹{getSubtotal().toFixed(2)}</span></div>
                <div className="flex justify-between text-[10px] font-black text-white/30 uppercase border-b border-white/5 pb-2"><span>Tax (5%)</span><span>₹{getGST().toFixed(2)}</span></div>
                <div className="flex items-center justify-between pt-2">
                   <div>
                      <span className="text-[8px] font-black text-orange-400 block mb-1">TOTAL</span>
                      <span className="text-4xl font-black italic tracking-tighter">₹{getTotal().toFixed(2)}</span>
                   </div>
                   <button onClick={handlePrint} className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-orange-600 transition-all"><Printer size={20}/></button>
                </div>
                <button onClick={handlePlaceOrder} className="w-full py-6 bg-orange-600 rounded-[30px] font-black uppercase italic text-xs shadow-xl shadow-orange-600/20 active:scale-95 transition-all">Submit Order →</button>
             </div>
          </div>
      </aside>
    </div>
  );
};

export default POS;
