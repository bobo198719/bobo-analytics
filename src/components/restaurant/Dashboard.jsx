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
  ArrowUpRight,
  Brain,
  Sparkles,
  Target,
  BarChart3,
  MousePointer2,
  PieChart,
  Calendar,
  Layers,
  Monitor
} from 'lucide-react';
import MatrixAnalytics from './MatrixAnalytics';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('ops'); // ops or market
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    activeTables: 0,
    pendingOrders: 0,
    history: [],
    recent: []
  });

  const [aiInsights, setAiInsights] = useState([
    { id: 1, title: 'Revenue Surge Predicted', desc: 'Expected +18% increase between 7 PM - 9 PM based on historical trend.', icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, type: 'prediction' },
    { id: 2, title: 'Inventory Alert', desc: 'Avocado stock is depleting 2.4x faster than usual. Restock recommended.', icon: <AlertCircle className="w-4 h-4 text-orange-400" />, type: 'alert' },
    { id: 3, title: 'Item Optimization', desc: '"Classic Margherita" shows high re-order rate (+88%). Consider featuring.', icon: <Sparkles className="w-4 h-4 text-indigo-400" />, type: 'insight' }
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const data = {
        total_revenue: 84500,
        orders_today: 142,
        active_tables: 14,
        kitchen_queue: 8,
        history: [
            { date: 'MON', total: 62000 },
            { date: 'TUE', total: 45000 },
            { date: 'WED', total: 78000 },
            { date: 'THU', total: 52000 },
            { date: 'FRI', total: 89000 },
            { date: 'SAT', total: 110000 },
            { date: 'SUN', total: 95000 }
        ],
        recent: [
           { id: 1, table_number: 'VIP 1', total: 4500, status: 'Served' },
           { id: 2, table_number: '04', total: 1200, status: 'Preparing' },
           { id: 3, table_number: '12', total: 3200, status: 'Pending' }
        ]
      };
      
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
    const interval = setInterval(fetchStats, 10000); 
    return () => clearInterval(interval);
  }, []);

  const Card = ({ title, value, icon, gradient, subValue, trend }) => (
    <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 hover:bg-white/[0.08] hover:border-orange-500/30 transition-all group relative overflow-hidden shadow-2xl">
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
    window.location.hash = section;
  };

  const role = typeof window !== 'undefined' ? localStorage.getItem('ro_role') || 'owner' : 'owner';
  const isOwner = role === 'owner';

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-['Plus_Jakarta_Sans'] pb-20">
      
      {error && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-600 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce italic text-white">
              ALERT: {error}
          </div>
      )}

      {/* DASHBOARD MODAL NAV */}
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[32px] border border-white/10 w-fit">
          <button 
              onClick={() => setActiveTab('ops')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center gap-3 ${activeTab === 'ops' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-white/30 hover:text-white'}`}
          >
              <Monitor className="w-3 h-3" /> Live Operations
          </button>
          <button 
              onClick={() => setActiveTab('market')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center gap-3 ${activeTab === 'market' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-white/30 hover:text-white'}`}
          >
              <PieChart className="w-3 h-3" /> Market Intelligence
          </button>
      </div>

      {activeTab === 'ops' ? (
        <>
            {/* OS HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                   <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">Restaurant <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">Intelligence</span></h1>
                   <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic leading-none">Autonomous Operation Matrix | V2.3 | Active Terminal: ID-001</p>
                </div>
                <div className="flex items-center gap-6 relative z-10">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.7)]"></div>
                      <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Live Neural Link Active</span>
                   </div>
                   <button onClick={() => setActiveTab('market')} className="px-10 py-5 bg-white/5 border border-white/10 rounded-[32px] text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all italic text-white/40">View Historical Profit</button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
            </header>

            {/* CORE STATS GRID */}
            <section className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isOwner ? '4' : '2'} gap-8`}>
              {isOwner && <div className="cursor-pointer"><Card title="Shift Revenue" value={`₹${stats.todayRevenue.toLocaleString()}`} icon={<TrendingUp className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-orange-400 to-orange-600" trend="+12.4%" subValue="Performance: Optimal" /></div>}
              <div onClick={() => switchSection('pos')} className="cursor-pointer"><Card title="Traffic Volume" value={stats.totalOrders} icon={<ShoppingCart className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-indigo-400 to-indigo-600" trend="+8.2%" subValue="Dine-in Activity Live" /></div>
              <div onClick={() => switchSection('tables')} className="cursor-pointer"><Card title="Active Tables" value={stats.activeTables} icon={<Zap className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-amber-400 to-amber-600" subValue="Occupied Now" /></div>
              {isOwner && <div onClick={() => switchSection('kitchen')} className="cursor-pointer"><Card title="Kitchen Queue" value={`${stats.pendingOrders} KOTs`} icon={<Clock className="text-white w-6 h-6" />} gradient="bg-gradient-to-br from-rose-400 to-rose-600" subValue="Avg: 18 min prep time" /></div>}
            </section>

            {/* DUAL COLUMN ANALYSIS HUB */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* REVENUE PROJECTION (LEFT 2/3) */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[56px] p-12 relative overflow-hidden group shadow-2xl">
                    <div className="flex justify-between items-center mb-16 relative z-10">
                        <div>
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Revenue <span className="text-orange-500">Projection</span></h3>
                          <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] italic mt-2">7-Day Profit Matrix | Real-time Synchronization</p>
                        </div>
                    </div>

                    <div className="h-[340px] flex items-end justify-between gap-6 px-10 relative z-10 pb-8">
                        {stats.history.length === 0 ? (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-10">
                                <Activity className="w-16 h-16 mb-6 animate-pulse" />
                                <p className="font-black italic uppercase text-xs tracking-[0.3em]">Matrix Data Depleted</p>
                            </div>
                        ) : (
                            stats.history.map((h, i) => {
                                const max = Math.max(...stats.history.map(x => Number(x.total))) || 1;
                                const height = (Number(h.total) / max) * 100;
                                return (
                                    <div key={i} className="flex-1 group relative flex flex-col items-center">
                                        <div className="absolute -top-14 bg-white text-black px-4 py-3 rounded-2xl text-[11px] font-black italic opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 border-2 border-orange-500/20">₹{Number(h.total).toLocaleString()}</div>
                                        <div 
                                            style={{ height: `${height}%`, minHeight: '16px' }} 
                                            className={`w-full max-w-[56px] rounded-3xl transition-all duration-1000 relative overflow-hidden bg-white/5 group-hover:bg-white/10 group-hover:border-orange-500/40 border border-white/10 ${i === stats.history.length - 1 ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-2xl shadow-orange-500/20' : 'shadow-inner'}`}
                                        >
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <p className="text-center text-[9px] text-white/20 font-black mt-8 uppercase tracking-[0.2em] italic group-hover:text-white transition-colors">{h.date}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* AI ANALYTICS COLUMN (RIGHT 1/3) */}
                <div className="bg-white/5 border border-white/10 rounded-[56px] p-12 relative overflow-hidden group shadow-2xl border-indigo-500/10">
                    <div className="flex items-center gap-4 mb-12 relative z-10">
                        <div className="p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 shadow-xl shadow-indigo-500/5">
                            <Brain className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Neural <span className="text-indigo-400">Insights</span></h3>
                          <p className="text-[9px] font-black uppercase text-indigo-400/40 tracking-widest italic group-hover:text-indigo-400 transition-colors">Intelligence Matrix Active</p>
                        </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                        {aiInsights.map(insight => (
                            <div key={insight.id} className="p-6 bg-black/40 rounded-[32px] border border-white/5 hover:border-indigo-500/30 transition-all group/insight relative overflow-hidden">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-white/5 rounded-xl group-hover/insight:bg-indigo-500/10 transition-colors">
                                        {insight.icon}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white italic group-hover/insight:text-indigo-400 transition-colors">{insight.title}</p>
                                </div>
                                <p className="text-[11px] font-black text-white/40 leading-relaxed uppercase tracking-tight italic">{insight.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-[-15%] right-[-15%] opacity-5 group-hover:opacity-10 transition-opacity"><Layers className="w-48 h-48 text-indigo-500" /></div>
                </div>
            </div>
        </>
      ) : (
        <div className="animate-in slide-in-from-bottom-5 duration-500">
           <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-2xl mb-12">
               <div className="relative z-10">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-white">Market <span className="bg-gradient-to-r from-indigo-500 to-indigo-300 bg-clip-text text-transparent text-5xl">Intelligence Lab</span></h1>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic leading-none">Deep History Ledger | Profit Leadership Analysis</p>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 transition-all"></div>
           </header>
           <MatrixAnalytics />
        </div>
      )}

      {/* QUICK TERMINAL ACCESS (ALWAYS SHOWN) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
            { id: 'pos', title: "POS Rail", desc: "Live Yeild Matrix", icon: <Receipt className="w-7 h-7" />, grad: "from-orange-500 to-rose-600" },
            { id: 'menu', title: "Inventory Hub", desc: "Product Matrix Node", icon: <LayoutGrid className="w-7 h-7" />, grad: "from-rose-500 to-indigo-600" },
            { id: 'tables', title: "Floor Grid", desc: "Space & Order Sync", icon: <LayoutGrid className="w-7 h-7" />, grad: "from-indigo-500 to-cyan-600" },
            { id: 'kitchen', title: "Kitchen Hub", desc: "KDS Queue Terminal", icon: <ChefHat className="w-7 h-7" />, grad: "from-cyan-500 to-emerald-600" }
         ].map((card, idx) => (
            <div key={idx} onClick={() => switchSection(card.id)} className={`p-10 bg-gradient-to-br ${card.grad} rounded-[56px] flex flex-col justify-between min-h-[300px] group shadow-[0_40px_100px_rgba(0,0,0,0.5)] hover:scale-[1.03] transition-all cursor-pointer relative overflow-hidden border border-white/20 active:scale-95`}>
               <div className="w-20 h-20 bg-white/20 backdrop-blur-2xl rounded-3xl flex items-center justify-center text-white mb-8 border border-white/20 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-3xl">{card.icon}</div>
               <div className="relative z-10">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-white">{card.title}</h2>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-4 italic">{card.desc}</p>
               </div>
               <div className="absolute top-8 right-12 text-white/10 text-9xl font-black italic -z-0">0{idx+1}</div>
            </div>
         ))}
      </section>

    </div>
  );
};

export default Dashboard;
