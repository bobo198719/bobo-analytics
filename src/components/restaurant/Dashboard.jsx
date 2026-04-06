import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle,
  Clock,
  LayoutGrid,
  ChefHat,
  Receipt,
  Users2,
  Zap,
  Activity,
  ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    activeTables: 0,
    pendingOrders: 0,
    history: [],
    recent: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/v2/restaurant/dashboard?v=${Date.now()}`);
      if (!res.ok) throw new Error("ANALYTICS HUB OFFLINE");
      const data = await res.json();
      
      setStats({
        todayRevenue: Number(data.total_revenue) || 0,
        totalOrders: Number(data.orders_today) || 0,
        activeTables: Number(data.active_tables) || 0,
        pendingOrders: Number(data.kitchen_queue) || 0,
        history: data.history || [],
        recent: data.recent || []
      });
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Fetch Fail:", err);
      setError("DATA STREAM DISRUPTED: CHECK BACKEND NODE");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // WebSocket disabled/offline fallback -> Safe 10s Polling
    const interval = setInterval(fetchStats, 10000); 
    
    // Attempt WebSocket, but rely on polling if it fails
    const ws = new WebSocket('wss://srv1449576.hstgr.cloud:8080');
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'NEW_ORDER' || msg.type === 'STATUS_CHANGE') {
            fetchStats();
        }
    };
    return () => {
        clearInterval(interval);
        ws.close();
    };
  }, []);

  const Card = ({ title, value, icon, gradient, subValue, trend }) => (
    <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 hover:bg-white/[0.08] hover:border-orange-500/30 transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-6 relative z-10 transition-transform group-hover:-translate-y-1">
        <div className={`p-4 rounded-3xl ${gradient} shadow-lg shadow-orange-500/10 group-hover:scale-110 transition-transform`}>
           {icon}
        </div>
        {trend && (
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-[10px] font-black italic text-emerald-400">{trend}</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
           </div>
        )}
      </div>
      
      <div className="relative z-10">
         <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">{title}</p>
         <h3 className={`text-4xl font-black italic tracking-tighter ${loading ? 'animate-pulse opacity-20' : 'text-white'}`}>
            {loading ? '---' : value}
         </h3>
         {subValue && <p className="text-white/20 text-[10px] mt-4 font-black uppercase tracking-widest italic">{subValue}</p>}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all opacity-0 group-hover:opacity-100"></div>
    </div>
  );

  const switchSection = (section) => {
    window.dispatchEvent(new CustomEvent('switch-ros-section', { detail: { section } }));
  };

  const role = typeof window !== 'undefined' ? localStorage.getItem('ro_role') || 'owner' : 'owner';
  const isOwner = role === 'owner';

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-['Plus_Jakarta_Sans']">
      
      {error && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce italic">
              ALERT: {error}
          </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group">
          <div className="relative z-10">
             <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Restaurant <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">Intelligence</span></h1>
             <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em] mt-3 italic">Autonomous Operation Matrix | V2.3 | ID: RO-992</p>
          </div>
          <div className="flex items-center gap-6 relative z-10">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Live Feed Active</span>
             </div>
             <button className="px-8 py-4 bg-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-600/30 hover:scale-[1.05] transition-all italic">Generate Report</button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
      </header>

      <section className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isOwner ? '4' : '3'} gap-8`}>
        {isOwner && <div onClick={() => switchSection('analytics')} className="cursor-pointer"><Card title="Shift Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} icon={<TrendingUp className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-orange-400 to-orange-600" trend="+12.4%" subValue="Performance: Optimal" /></div>}
        <div onClick={() => switchSection('pos')} className="cursor-pointer"><Card title="Traffic Volume" value={stats.totalOrders} icon={<ShoppingCart className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-indigo-400 to-indigo-600" trend="+8.2%" subValue="Dine-in Activity Live" /></div>
        <div onClick={() => switchSection('tables')} className="cursor-pointer"><Card title="Active Tables" value={stats.activeTables} icon={<Zap className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-amber-400 to-amber-600" subValue="Occupied Now" /></div>
        <div onClick={() => switchSection('kitchen')} className="cursor-pointer"><Card title="Kitchen Queue" value={`${stats.pendingOrders} KOTs`} icon={<Clock className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-rose-400 to-rose-600" subValue="Avg: 18 min prep time" /></div>
      </section>

      <section className={`grid grid-cols-1 lg:grid-cols-${isOwner ? '3' : '1'} gap-8`}>
        {isOwner && (
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12 relative z-10">
              <div>
                 <h3 className="text-xl font-black italic uppercase tracking-tight">Revenue Projection</h3>
                 <p className="text-[10px] font-black uppercase text-white/20 tracking-widest italic">Weekly Yield Distribution (Last 7 Days)</p>
              </div>
            </div>
            
            <div className="h-[300px] flex items-end justify-between gap-4 px-6 relative z-10 pb-8">
              {stats.history.length === 0 ? (
                  <div className="w-full flex flex-col items-center justify-center opacity-10">
                      <Activity className="w-12 h-12 mb-4 animate-pulse" />
                      <p className="font-black italic uppercase text-[10px] tracking-[0.3em]">Matrix Data Depleted</p>
                  </div>
              ) : (
                  stats.history.map((h, i) => {
                      const max = Math.max(...stats.history.map(x => Number(x.total))) || 1;
                      const height = (Number(h.total) / max) * 100;
                      return (
                          <div key={i} className="flex-1 group relative flex flex-col items-center">
                              {/* Phase 1: Show ₹ values above bars */}
                              <div className="absolute -top-12 bg-white text-black px-3 py-2 rounded-xl text-[10px] font-black italic opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-2xl z-20 border border-white shadow-orange-500/10">₹{Number(h.total).toLocaleString()}</div>
                              <div 
                                  style={{ height: `${height}%`, minHeight: '12px' }} 
                                  className={`w-full max-w-[48px] rounded-2xl transition-all duration-1000 relative overflow-hidden bg-white/5 group-hover:bg-white/10 group-hover:border-orange-500/30 border border-white/5 ${i === stats.history.length - 1 ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-xl shadow-orange-500/20' : 'shadow-inner'}`}
                              >
                                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                              <p className="text-center text-[8px] text-white/30 font-black mt-6 uppercase tracking-widest italic group-hover:text-white transition-colors">{h.date}</p>
                          </div>
                      );
                  })
              )}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-500/5 to-transparent -z-10"></div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
           <h3 className="text-xl font-black italic uppercase tracking-tight mb-10 relative z-10 text-orange-400">Kitchen Pulse</h3>
           <div className="space-y-4 relative z-10">
              {stats.recent.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center opacity-10 scale-75">
                      <ChefHat className="w-16 h-16 mb-6" />
                      <p className="font-black italic uppercase text-[10px] tracking-[0.2em]">Matrix Offline</p>
                  </div>
              ) : (
                  stats.recent.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/[0.08] hover:border-orange-500/30 transition-all cursor-crosshair group/row">
                      <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-orange-500 border border-white/10 shadow-lg group-hover/row:scale-110 transition-transform`}><ChefHat className="w-6 h-6" /></div>
                         <div>
                            <p className="text-xs font-black italic uppercase tracking-tight">Order #{item.id}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest italic mt-1 ${item.status === 'pending' ? 'text-yellow-400' : item.status === 'preparing' ? 'text-orange-400' : 'text-blue-400'}`}>{item.status} | Table {item.table_number}</p>
                         </div>
                      </div>
                      <div className="text-white/20 font-black italic text-[10px] bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-md">LIVE</div>
                    </div>
                  ))
              )}
              <button onClick={() => switchSection('kitchen')} className="w-full py-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic mt-8 shadow-xl">Audit Matrix Terminal</button>
           </div>
           <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] -z-10"></div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
         {[
            { id: 'pos', title: "POS Terminal", desc: "Fast Billing & Yields", icon: <Receipt />, grad: "from-orange-500 to-rose-600" },
            { id: 'menu', title: "Menu Matrix", desc: "QR & Product Hub", icon: <LayoutGrid />, grad: "from-rose-500 to-indigo-600" },
            { id: 'tables', title: "Table Matrix", desc: "Space & Grid Sync", icon: <LayoutGrid />, grad: "from-indigo-500 to-cyan-600" }
         ].map((card, idx) => (
            <div key={idx} onClick={() => switchSection(card.id)} className={`p-10 bg-gradient-to-br ${card.grad} rounded-[48px] flex flex-col justify-between min-h-[260px] group shadow-2xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden backdrop-blur-3xl border border-white/10`}>
               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-xl">{card.icon}</div>
               <div className="relative z-10">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white">{card.title}</h2>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-4 italic">{card.desc}</p>
               </div>
               <div className="absolute top-4 right-8 text-white/10 text-8xl font-black italic -z-0">0{idx+1}</div>
            </div>
         ))}
      </section>
    </div>
  );
};

export default Dashboard;
