import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Clock, 
  Utensils, 
  CheckCircle2,
  AlertCircle,
  Timer,
  Zap,
  Bell,
  CheckCircle
} from 'lucide-react';

const KDS = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      // Phase 5: Polling every 3s. Removing filter to allow status mapping.
      const res = await fetch('/api/v2/restaurant/orders?all=true');
      if (!res.ok) throw new Error("KDS HUB OFFLINE");
      const data = await res.json();
      // Only show non-completed for primary queue
      setOrders(data.filter(o => o.status !== 'completed'));
      setError(null);
      setLoading(false);
    } catch (err) { 
        console.error("KDS Fetch Error:", err); 
        setError("KITCHEN TERMINAL ERROR: CHECK NETWORK CONNECTION");
        setLoading(false); 
    }
  };

  useEffect(() => {
    fetchOrders(); 
    const interval = setInterval(fetchOrders, 3000); 

    const ws = new WebSocket('wss://srv1449576.hstgr.cloud:8080');
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'NEW_ORDER' || msg.type === 'STATUS_CHANGE') {
            fetchOrders();
        }
    };

    return () => {
        clearInterval(interval);
        ws.close();
    };
  }, []);

  const updateStatus = async (orderId, nextStatus) => {
    try {
        const res = await fetch(`/api/v2/restaurant/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });
        if (res.ok) fetchOrders();
    } catch (err) { console.error("KDS Update Error:", err); }
  };

  // Phase 2: Kitchen Status Colors
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          bg: 'bg-[#facc15]/10', 
          border: 'border-[#facc15]/40', 
          text: 'text-[#facc15]', 
          glow: 'shadow-[#facc15]/20',
          label: 'Inbound'
        };
      case 'preparing':
        return { 
          bg: 'bg-[#fb923c]/10', 
          border: 'border-[#fb923c]/40', 
          text: 'text-[#fb923c]', 
          glow: 'shadow-[#fb923c]/20',
          label: 'Prepping'
        };
      case 'ready':
        return { 
          bg: 'bg-[#38bdf8]/10', 
          border: 'border-[#38bdf8]/40', 
          text: 'text-[#38bdf8]', 
          glow: 'shadow-[#38bdf8]/20',
          label: 'Ready'
        };
      default:
        return { 
          bg: 'bg-[#4ade80]/10', 
          border: 'border-[#4ade80]/40', 
          text: 'text-[#4ade80]', 
          glow: 'shadow-[#4ade80]/20',
          label: 'Success'
        };
    }
  };

  return (
    <>
      {error && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce italic">
              ALERT: {error}
          </div>
      )}
      <div className="space-y-12 animate-in fade-in duration-500 font-['Plus_Jakarta_Sans']">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Kitchen <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">KDS Engine</span></h1>
            <p className="text-white/30 mt-3 uppercase text-[10px] font-black tracking-[0.4em] italic leading-none">High-Priority Direct Stream | Node ID: KDS-ALPHA</p>
          </div>
          <div className="flex gap-6 relative z-10">
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-6 shadow-2xl backdrop-blur-xl">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-yellow-500 font-black italic text-2xl shadow-xl shadow-yellow-500/10">{orders.filter(o => o.status === 'pending').length}</div>
                <div>
                   <p className="text-[8px] font-black uppercase text-white/20 tracking-widest italic">Inbound KOTs</p>
                   <p className="text-xs font-black italic uppercase">Critical Queue</p>
                </div>
             </div>
             <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-6 shadow-2xl backdrop-blur-xl">
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 font-black italic text-2xl shadow-xl shadow-orange-500/10">{orders.filter(o => o.status === 'preparing').length}</div>
                <div>
                   <p className="text-[8px] font-black uppercase text-white/20 tracking-widest italic">Station Activity</p>
                   <p className="text-xs font-black italic uppercase">Active Prepping</p>
                </div>
             </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
          {orders.length === 0 ? (
            <div className="col-span-full h-80 flex flex-col items-center justify-center opacity-20 bg-white/5 border-2 border-dashed border-white/10 rounded-[48px]">
                <ChefHat className="w-16 h-16 mb-4" />
                <p className="font-black italic uppercase tracking-[0.3em] text-xs">No Active Pipeline Data</p>
            </div>
          ) : (
            orders.map((order) => {
              const cfg = getStatusConfig(order.status);
              return (
                <div 
                  key={order.id}
                  className={`flex flex-col h-[520px] bg-white/5 border-2 rounded-[56px] p-10 transition-all relative overflow-hidden group hover:bg-white/[0.08] hover:border-white/20 shadow-2xl ${cfg.border}`}
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 blur-3xl opacity-10 transition-opacity group-hover:opacity-30 ${cfg.bg.replace('/10', '/30')}`}></div>

                  <div className="flex items-center justify-between mb-10 relative z-10">
                     <div className="flex flex-col">
                         <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">ORDER #{order.id}</h3>
                         <div className="flex items-center gap-2 text-white/20 font-black uppercase text-[8px] tracking-[0.2em] mt-3 italic">
                            <Zap size={12} className={cfg.text} />
                            TABLE {order.table_number}
                         </div>
                     </div>
                     <div className={`p-1.5 px-4 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-lg ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        {cfg.label}
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 mb-10 relative z-10 space-y-4">
                      {order.items?.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/20 transition-all hover:bg-white/10">
                            <div className={`w-2 h-2 rounded-full ${cfg.text} animate-pulse`}></div>
                            <p className="font-black italic text-sm tracking-tight text-white/80">
                              {item.quantity}x {item.name || `Item ${item.menu_item_id}`}
                            </p>
                         </div>
                      ))}
                  </div>

                  <div className="pt-8 border-t border-white/5 relative z-10 flex flex-col gap-6">
                     <div className="flex items-center justify-between text-white/20 text-[9px] font-black uppercase tracking-[0.2em] italic">
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Pipeline Signal: Active</div>
                     </div>

                     {order.status === 'pending' && (
                       <button 
                         onClick={() => updateStatus(order.id, 'preparing')}
                         className="w-full py-6 bg-[#fb923c] rounded-3xl font-black italic uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-orange-600/30 hover:scale-[1.05] active:scale-95 transition-all text-white"
                       >
                         Commence Matrix
                       </button>
                     )}

                     {order.status === 'preparing' && (
                       <button 
                         onClick={() => updateStatus(order.id, 'ready')}
                         className="w-full py-6 bg-[#38bdf8] rounded-3xl font-black italic uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-600/30 hover:scale-[1.05] active:scale-95 transition-all text-white"
                       >
                         Commence Delivery
                       </button>
                     )}

                     {order.status === 'ready' && (
                       <button 
                         onClick={() => updateStatus(order.id, 'completed')}
                         className="w-full py-6 bg-[#4ade80] rounded-3xl font-black italic uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-emerald-600/30 hover:scale-[1.05] active:scale-95 transition-all text-white"
                       >
                         KOT Finalized
                       </button>
                     )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </>
  );
};

export default KDS;
