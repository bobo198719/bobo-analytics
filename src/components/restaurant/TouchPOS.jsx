import React, { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, Printer, AlertTriangle, MonitorPlay, Usb } from 'lucide-react';
import { ThermalPrinter } from '../../utils/ThermalPrinter.js';

const TouchPOS = () => {
  const [categories, setCategories] = useState(['All', 'Starters', 'Main Course', 'Beverages', 'Desserts']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [fsMode, setFsMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg) => {
     setToastMessage(msg);
     setTimeout(() => setToastMessage(null), 1500);
  };

  const menuData = [
      { id: 1, name: "Truffle Mushroom Risotto", category: "Main Course", price: 650, image_url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400" },
      { id: 2, name: "Spicy Tuna Tartare", category: "Starters", price: 450, image_url: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80&w=400" },
      { id: 3, name: "Artisan Margherita", category: "Main Course", price: 550, image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a30536?auto=format&fit=crop&q=80&w=400" },
      { id: 4, name: "Lychee Rose Mocktail", category: "Beverages", price: 250, image_url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400" },
      { id: 5, name: "Grilled Salmon Asparagus", category: "Main Course", price: 850, image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=400" },
      { id: 6, name: "Classic Caesar Salad", category: "Starters", price: 350, image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=400" },
      { id: 7, name: "Dark Chocolate Fondant", category: "Desserts", price: 380, image_url: "https://images.unsplash.com/photo-1511381939415-e440c9c36202?auto=format&fit=crop&q=80&w=400" },
      { id: 8, name: "Cold Brew Iced Coffee", category: "Beverages", price: 220, image_url: "https://images.unsplash.com/photo-1461023058943-07cb1ce8dbcf?auto=format&fit=crop&q=80&w=400" },
      { id: 9, name: "Wagyu Beef Burger", category: "Main Course", price: 950, image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400" },
      { id: 10, name: "New York Cheesecake", category: "Desserts", price: 420, image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=400" }
  ];

  const tablesData = [
      { id: 1, num: "T1" },
      { id: 2, num: "T2" },
      { id: 3, num: "T3" },
      { id: 4, num: "T4" },
      { id: 5, num: "VIP-1" }
  ];

  useEffect(() => {
    setItems(menuData);
    setTables(tablesData);
    // Auto Fullscreen Request
    const tryFs = () => {
       if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
       }
    };
    document.addEventListener('click', tryFs, {once: true});
  }, []);

  const toggleFs = () => {
     if (!document.fullscreenElement) {
         document.documentElement.requestFullscreen().then(() => setFsMode(true)).catch(() => {});
     } else {
         document.exitFullscreen().then(() => setFsMode(false)).catch(() => {});
     }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    showToast(`Added ✔`);
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

  const handleGenerateBill = async () => {
    if (!selectedTable) return alert("Please select a table before generating the bill!");
    if (cart.length === 0) return alert("Basket is empty!");
    
    try {
       // 1. SaaS Verification Gate
       const saasCheck = await fetch('/api/v2/saas/subscription', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ tenantId: "demo", action: "check_hardware" })
       });
       if (!saasCheck.ok) {
           const err = await saasCheck.json();
           alert(`SaaS Lock: ${err.error}`);
           return;
       }

       const orderId = "ORD-" + Math.floor(Math.random() * 1000000);
       
       // 2. Persist to Backend Database Matrix
       await fetch('/api/v2/restaurant/pos-orders', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
               order_id: orderId,
               items: cart,
               total_amount: getTotal(),
               table_id: selectedTable,
               saas_tenant_id: "demo_rest_01"
           })
       });

       alert("Order saved in Database Matrix!");

       // 3. Connect and Execute Hardware Print (Thermal Printer)
       try {
           const printer = new ThermalPrinter();
           const connected = await printer.connect();
           if (connected) {
               await printer.printReceipt({
                   orderId: orderId,
                   table: tables.find(t=>t.id === selectedTable)?.num || 'Unknown',
                   items: cart,
                   subtotal: getSubtotal(),
                   tax: getGST(),
                   total: getTotal()
               });
               await printer.disconnect();
               showToast("Thermal Print Successful ✔");
           } else {
               // Fallback to browser UI print simulation if hardware not found
               window.open(`/print/${orderId}`, '_blank');
           }
       } catch (hwError) {
          console.log("Hardware Error, falling back to Web UI:", hwError);
          window.open(`/print/${orderId}`, '_blank');
       }

       setCart([]);
       setSelectedTable(null);

    } catch (err) {
       console.error(err);
       alert("CRITICAL FAIL: Matrix disconnected.");
    }
  };

  const handlePrintDone = () => {
     setShowReceipt(false);
     setCart([]);
     setSelectedTable(null);
  };

  const ReceiptOverlay = () => (
    <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white text-black p-10 rounded-sm w-[400px] shadow-2xl relative font-mono text-xs ReceiptPrintArea">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-black uppercase">Bobo Touch CRM</h1>
                <p>Table: {tables.find(t=>t.id === selectedTable)?.num}</p>
                <p>GST: 07GHAAAA0000Z1</p>
            </div>
            <div className="border-b-2 border-dashed border-black my-4"></div>
            {cart.map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                    <span className="flex-1 font-bold">{item.name} x{item.quantity}</span>
                    <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
            <div className="border-b-2 border-dashed border-black my-4"></div>
            <div className="flex justify-between font-bold"><span>Subtotal:</span><span>₹{getSubtotal().toFixed(2)}</span></div>
            <div className="flex justify-between font-bold"><span>Tax (5%):</span><span>₹{getGST().toFixed(2)}</span></div>
            <div className="flex justify-between text-2xl font-black mt-4"><span>TOTAL:</span><span>₹{getTotal().toFixed(2)}</span></div>
            
            <div className="grid grid-cols-2 gap-4 mt-10 no-print">
               <button onClick={handlePrintDone} className="bg-red-500 text-white py-4 font-bold border-none">CANCEL / CLOSE</button>
               <button onClick={() => window.print()} className="bg-green-600 text-white py-4 font-bold border-none">PRINT BILL</button>
            </div>
        </div>
        <style>{`
           @media print { 
             body * { visibility: hidden; } 
             .ReceiptPrintArea, .ReceiptPrintArea * { visibility: visible; }
             .ReceiptPrintArea { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; }
             .no-print { display: none !important; } 
           }
        `}</style>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#111] font-sans overflow-hidden text-white touch-none">
      {/* Toast Notification */}
      {toastMessage && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white font-black px-8 py-4 rounded-full shadow-2xl z-[9999] flex items-center gap-3 animate-bounce">
            <span className="text-xl">{toastMessage}</span>
         </div>
      )}

      {showReceipt && <ReceiptOverlay />}

      {/* TOP NAVBAR */}
      <div className="flex justify-between items-center bg-[#222] px-6 py-4 shadow-lg flex-shrink-0 border-b border-[#333]">
         <div className="flex items-center gap-4">
             <div className="bg-orange-500 text-white font-black italic rounded-xl px-4 py-2 text-xl">BOBO POS</div>
             <div className="bg-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-lg text-sm border border-emerald-500/30">ONLINE</div>
         </div>
         <div className="flex gap-6 items-center">
             <div className="relative">
                 <input 
                    type="text" 
                    placeholder="Search item..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#111] border border-[#333] px-6 py-3 rounded-full text-white placeholder-gray-500 outline-none focus:border-orange-500 w-[200px] transition-all font-bold"
                 />
             </div>
             {/* Category Tabs */}
             <div className="flex bg-[#111] p-1 rounded-xl">
               {categories.map((cat, i) => (
                  <button 
                     key={i} 
                     onClick={() => setActiveCategory(cat)} 
                     className={`px-6 py-3 rounded-lg font-black uppercase text-sm transition-all ${activeCategory === cat ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}
                  >
                     {cat}
                  </button>
               ))}
             </div>
         </div>
         <div className="flex items-center gap-4">
             <button onClick={toggleFs} className="bg-[#333] p-3 rounded-xl hover:bg-[#444] transition-all"><MonitorPlay size={20}/></button>
             <button onClick={() => window.location.href='/touch-pos-login'} className="bg-red-500/20 text-red-500 font-bold px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all"><LogOut size={16}/> EXIT</button>
         </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
         {/* LEFT: GRID */}
         <div className="flex-[2] overflow-y-auto p-6 bg-[#181818]" style={{ scrollbarWidth: 'none' }}>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {items.filter(it => (activeCategory === 'All' || it.category === activeCategory) && it.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                  <div 
                     key={item.id} 
                     onClick={() => addToCart(item)}
                     className="bg-[#2a2a2a] rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-all outline outline-2 outline-transparent group shadow-lg"
                     style={{ touchAction: 'manipulation' }}
                     onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; e.currentTarget.style.background = '#ff7a00'; }}
                     onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#2a2a2a'; }}
                     onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#2a2a2a'; }}
                  >
                     <div className="h-40 w-full relative pointer-events-none">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[600ms]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                           <span className="text-white font-black text-2xl drop-shadow-md">₹{item.price}</span>
                        </div>
                     </div>
                     <div className="p-4 pointer-events-none">
                        <h4 className="font-bold text-lg leading-tight uppercase line-clamp-2">{item.name}</h4>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* RIGHT: SELECTED ITEMS PANEL + BILLING */}
         <div className="flex-[1] min-w-[400px] border-l border-[#333] flex flex-col bg-[#222]">
            {/* Table Selector (Touch Friendly) */}
            <div className="p-4 border-b border-[#333] bg-[#1a1a1a]">
               <div className="font-black text-xs uppercase text-gray-400 mb-2">Select Active Table</div>
               <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {tables.map(t => (
                     <button 
                        key={t.id}
                        onClick={() => setSelectedTable(t.id)}
                        className={`flex-1 py-4 rounded-xl font-black text-[16px] transition-all border-2 ${selectedTable === t.id ? 'bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(255,120,0,0.5)] transform scale-105' : 'bg-[#333] border-transparent text-gray-400 hover:bg-[#444]'}`}
                        style={{ height: '60px' }}
                     >
                        {t.num}
                     </button>
                  ))}
               </div>
            </div>

            {/* Selected Items Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none' }}>
               {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                     <ShoppingCart size={64} className="mb-4" />
                     <p className="font-bold font-lg">BASKET IS EMPTY</p>
                     <p className="text-sm">Tap items to add them.</p>
                  </div>
               ) : (
                  cart.map(item => (
                     <div key={item.id} className="bg-[#333] p-4 rounded-xl flex items-center justify-between border-l-4 border-orange-500">
                        <div className="flex-1 pr-4">
                           <div className="font-bold text-lg leading-tight uppercase truncate">{item.name}</div>
                           <div className="text-orange-400 font-black">₹{item.price}</div>
                        </div>
                        <div className="flex items-center gap-4 bg-[#111] p-2 rounded-lg">
                           <button onClick={() => removeFromCart(item.id)} className="bg-red-500/20 text-red-500 font-black active:bg-red-500 active:text-white transition-colors flex items-center justify-center" style={{ width: '40px', height: '40px', fontSize: '20px', borderRadius: '10px' }}>-</button>
                           <span className="font-black text-xl w-6 text-center">{item.quantity}</span>
                           <button onClick={() => addToCart(item)} className="bg-green-500/20 text-green-500 font-black active:bg-green-500 active:text-white transition-colors flex items-center justify-center" style={{ width: '40px', height: '40px', fontSize: '20px', borderRadius: '10px' }}>+</button>
                        </div>
                     </div>
                  ))
               )}
            </div>

            {/* Generate Bill Footer */}
            <div className="bg-[#111] p-6 border-t border-[#333] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
               <div className="flex justify-between items-center font-black text-gray-400 text-lg mb-2">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center font-black text-gray-400 text-lg mb-4 cursor-pointer">
                  <span>Tax (5%)</span>
                  <span>₹{getGST().toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <span className="font-black text-xl text-gray-300 block">TOTAL</span>
                     {cart.length > 0 && <button onClick={() => setCart([])} className="clear-btn text-red-500 font-bold uppercase text-xs hover:underline mt-1">Clear Cart</button>}
                  </div>
                  <span className="font-black text-white tracking-tighter" style={{ fontSize: '42px' }}>₹{getTotal().toFixed(2)}</span>
               </div>
               <button 
                  onClick={handleGenerateBill}
                  className="w-full flex items-center justify-center gap-4 text-white font-black uppercase tracking-wider"
                  style={{ height: '80px', fontSize: '24px', background: 'orange', borderRadius: '12px', boxShadow: '0 10px 30px rgba(255,120,0,0.4)', transition: 'all 0.1s', ":active": { transform: 'scale(0.98)' } }}
               >
                  <Printer size={32} />
                  <span>GENERATE BILL</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TouchPOS;
