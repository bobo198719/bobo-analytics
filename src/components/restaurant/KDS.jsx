import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  Utensils, 
  CheckCircle2,
  AlertCircle,
  Timer
} from 'lucide-react';

const KDS = () => {
  const [orders, setOrders] = useState([
    { id: '342', table: '05', items: ['Butter Chicken x1', 'Tandoori Roti x4'], status: 'pending', time: '2m' },
    { id: '341', table: '02', items: ['Paneer Tikka x2', 'Fresh Lime Soda x1'], status: 'preparing', time: '12m' },
    { id: '340', table: '07', items: ['Mutton Biryani x1', 'Gulab Jamun x2'], status: 'preparing', time: '18m' }
  ]);

  const updateStatus = (id, newStatus) => {
    if (newStatus === 'completed') {
      setOrders(orders.filter(o => o.id !== id));
    } else {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  const statusColors = {
    pending: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    preparing: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    ready: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight italic">Kitchen Pulse</h1>
          <p className="text-white/50 mt-1 uppercase text-xs font-bold tracking-widest">Live Culinary Operations | Terminal 01</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 font-black tracking-tighter shadow-lg shadow-rose-500/10">{orders.filter(o => o.status === 'pending').length}</div>
              <p className="text-[10px] font-black uppercase text-white/40">Pending KOT</p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 font-black tracking-tighter shadow-lg shadow-amber-500/10">{orders.filter(o => o.status === 'preparing').length}</div>
              <p className="text-[10px] font-black uppercase text-white/40">Actively Prepping</p>
           </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {orders.map((order, i) => (
          <div 
            key={order.id}
            className={`flex flex-col h-[480px] bg-white/5 border-2 rounded-[40px] p-8 transition-all relative overflow-hidden group hover:border-white/20 ${order.status === 'pending' ? 'border-rose-500/30 ring-4 ring-rose-500/5' : 'border-white/10'}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${order.status === 'pending' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex flex-col">
                  <h3 className="text-2xl font-black italic">#{order.id}</h3>
                  <div className="flex items-center gap-2 text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">
                     <Utensils className="w-3 h-3" />
                     Table {order.table}
                  </div>
               </div>
               <div className={`p-1.5 px-4 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[order.status]}`}>
                  {order.status}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mb-8 relative z-10 space-y-4">
               {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all">
                     <div className="w-2 h-2 rounded-full bg-white/20"></div>
                     <p className="font-bold text-sm tracking-tight">{item}</p>
                  </div>
               ))}
            </div>

            <div className="pt-8 border-t border-white/10 relative z-10 flex flex-col gap-4">
               <div className="flex items-center justify-between text-white/30 text-xs font-bold uppercase tracking-widest mb-2">
                  <div className="flex items-center gap-2"><Clock className="w-3 h-3" />{order.time} elapsed</div>
                  <div className="flex items-center gap-2"><Timer className="w-4 h-4" />{order.status === 'pending' ? '8m' : '15m'} Est</div>
               </div>

               {order.status === 'pending' && (
                 <button 
                   onClick={() => updateStatus(order.id, 'preparing')}
                   className="w-full py-5 bg-rose-500 rounded-3xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Start Prepping
                 </button>
               )}

               {order.status === 'preparing' && (
                 <button 
                   onClick={() => updateStatus(order.id, 'ready')}
                   className="w-full py-5 bg-amber-500 rounded-3xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Mark as Ready
                 </button>
               )}

               {order.status === 'ready' && (
                 <button 
                   onClick={() => updateStatus(order.id, 'completed')}
                   className="w-full py-5 bg-emerald-500 rounded-3xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Out for Table
                 </button>
               )}
            </div>
          </div>
        ))}

        {/* Placeholder for incoming */}
        <div className="flex h-[480px] bg-white/5 border-2 border-dashed border-white/5 rounded-[40px] items-center justify-center p-8 opacity-20">
           <div className="flex flex-col items-center gap-4">
              <ChefHat className="w-16 h-16" />
              <p className="font-black italic uppercase text-xs tracking-[0.2em]">Monitoring Network Queue...</p>
           </div>
        </div>
      </section>
    </div>
  );
};

export default KDS;
