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
  Users2
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    vegSales: 0,
    nonVegSales: 0,
    pendingOrders: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real stats here
    setTimeout(() => {
       setStats({
          todayRevenue: 45280,
          totalOrders: 142,
          vegSales: 65,
          nonVegSales: 77,
          pendingOrders: 12
       });
       setLoading(false);
    }, 1000);
  }, []);

  const Card = ({ title, value, icon, color, subValue }) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-bobo-accent transition-all group overflow-hidden relative">
      <div className="flex justify-between items-start">
        <div>
           <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
           <h3 className="text-3xl font-black text-white">{loading ? '...' : value}</h3>
           {subValue && <p className="text-white/40 text-sm mt-2 font-medium">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${color} bg-opacity-20 group-hover:scale-110 transition-transform`}>
           {icon}
        </div>
      </div>
      <div className={`absolute bottom-0 right-0 w-24 h-24 ${color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 -mr-12 -mb-12 transition-opacity`}></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">SaaS Master Engine</h1>
          <p className="text-white/50 mt-1">Bobo Restaurant CRM | Cloud Intelligence v4.2</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
           <button className="px-6 py-2 bg-bobo-accent text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-bobo-accent/20">Dashboard</button>
           <button className="px-6 py-2 text-white/50 hover:text-white font-bold rounded-xl text-sm transition-all">Analytics</button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Today's Revenue" value={`₹${stats.todayRevenue}`} icon={<TrendingUp className="text-emerald-400" />} color="bg-emerald-400" subValue="+12% from yesterday" />
        <Card title="Total Orders" value={stats.totalOrders} icon={<ShoppingCart className="text-blue-400" />} color="bg-blue-400" subValue="22 Delivery | 120 Dine-in" />
        <Card title="Veg / Non-Veg" value={`${stats.vegSales} / ${stats.nonVegSales}`} icon={<AlertCircle className="text-orange-400" />} color="bg-orange-400" subValue="65% Veg fulfillment" />
        <Card title="Pending KOT" value={stats.pendingOrders} icon={<Clock className="text-rose-400" />} color="bg-rose-400" subValue="Avg: 18 mins prep time" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">Intelligent Sales Projection</h3>
            <select className="bg-transparent text-white/40 border-none outline-none font-bold text-sm">
                <option>Weekly View</option>
                <option>Monthly View</option>
            </select>
          </div>
          <div className="h-[300px] flex items-end justify-between gap-2">
            {/* Simple Dynamic Chart */}
            {[55, 78, 45, 92, 63, 85, 70].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">₹{h * 100}</div>
                 <div style={{ height: `${h}%` }} className={`w-full rounded-t-xl transition-all duration-700 ${i === 3 ? 'bg-bobo-accent' : 'bg-white/10 group-hover:bg-white/20'}`}></div>
                 <p className="text-center text-[10px] text-white/30 font-bold mt-3 uppercase">Day {i + 1}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all">
           <h3 className="text-xl font-black mb-8">Live Kitchen Pulse</h3>
           <div className="space-y-6">
              {[
                { label: 'Order #342', status: 'Prepping', time: '5m', icon: <ChefHat className="w-4 h-4" /> },
                { label: 'Order #341', status: 'In Oven', time: '12m', icon: <ChefHat className="w-4 h-4" /> },
                { label: 'Order #340', status: 'Garnishing', time: '18m', icon: <ChefHat className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-bobo-accent/10 rounded-xl flex items-center justify-center text-bobo-accent">{item.icon}</div>
                     <div>
                        <p className="text-sm font-black">{item.label}</p>
                        <p className="text-xs text-white/40">{item.status}</p>
                     </div>
                  </div>
                  <div className="text-white/30 font-bold text-xs">{item.time}</div>
                </div>
              ))}
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Enter KDS Terminal</button>
           </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex flex-col justify-between min-h-[220px] group shadow-2xl shadow-indigo-500/20">
            <h2 className="text-2xl font-black">Real-time POS Terminal</h2>
            <div className="flex justify-between items-end">
               <p className="text-white/70 font-medium">Fast Billing & Table Management</p>
               <button className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">GO</button>
            </div>
         </div>
         <div className="p-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl flex flex-col justify-between min-h-[220px] group shadow-2xl shadow-orange-500/20">
            <h2 className="text-2xl font-black">Menu Cloud</h2>
            <div className="flex justify-between items-end">
               <p className="text-white/70 font-medium">Digital Items, QR & Inventories</p>
               <button className="w-12 h-12 bg-white text-orange-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">GO</button>
            </div>
         </div>
         <div className="p-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex flex-col justify-between min-h-[220px] group shadow-2xl shadow-rose-500/20">
            <h2 className="text-2xl font-black">Customer CRM</h2>
            <div className="flex justify-between items-end">
               <p className="text-white/70 font-medium">Loyalty, AI Marketing & History</p>
               <button className="w-12 h-12 bg-white text-rose-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">GO</button>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Dashboard;
