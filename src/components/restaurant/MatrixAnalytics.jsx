import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  Activity, 
  ChefHat, 
  Zap,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Flame,
  Star,
  Coffee,
  IceCream,
  Utensils,
  FastForward,
  Filter
} from 'lucide-react';

const MatrixAnalytics = () => {
    // ── INITIAL DEMO DATA (Prevents Blank Screen) ────────────────
    const initialDemo = {
        periods: { daily: 4250, weekly: 28400, monthly: 112000, yearly: 1240000 },
        dailySales: Array.from({length: 30}, (_, i) => ({ 
            date: `Mar ${i + 1}`, 
            total: Math.floor(Math.random() * 8000) + 2000 
        })),
        topProducts: [
            { category: 'Starter', name: 'Truffle Mushroom Arancini', sales_count: 84, total_revenue: 16800 },
            { category: 'Main Course', name: 'Wagyu Beef Ribeye', sales_count: 42, total_revenue: 84000 },
            { category: 'Fast Food', name: 'Double Truffle Burger', sales_count: 124, total_revenue: 24800 },
            { category: 'Dessert', name: 'Gold Leaf Lava Cake', sales_count: 56, total_revenue: 11200 },
            { category: 'Beverage', name: 'Aged Whiskey Sour', sales_count: 92, total_revenue: 18400 }
        ],
        busyHours: [
            { hour: 20, order_count: 45 }, { hour: 13, order_count: 38 }, 
            { hour: 19, order_count: 32 }, { hour: 14, order_count: 28 }, 
            { hour: 21, order_count: 24 }, { hour: 12, order_count: 20 }
        ],
        busyDays: [
            { day: 'Friday', order_count: 85 }, { day: 'Saturday', order_count: 92 }
        ],
        catYields: [
            { category: 'Main Course', revenue: 45000 }, { category: 'Starters', revenue: 12000 }
        ]
    };

    const [data, setData] = useState(initialDemo);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(true);
    const [selectedDate, setSelectedDate] = useState(`Mar 30`);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/v2/restaurant/analytics?v=${Date.now()}`);
            if (!res.ok) throw new Error("Offline");
            const result = await res.json();
            
            if (result.dailySales && result.dailySales.length > 5) {
                setData(result);
                setIsDemo(false);
            }
            setLoading(false);
        } catch (err) {
            console.log('Matrix using Demo Mode.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const downloadExcel = () => {
        if (typeof XLSX === 'undefined') return alert('Matrix Ledger Bridge Initializing... try in 5 seconds.');
        const ws = XLSX.utils.json_to_sheet(data.dailySales.map(d => ({
            Date: d.date,
            Yield: `₹${Math.round(d.total)}`,
            Status: d.total > 10000 ? 'PEAK' : 'STABLE'
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Matrix Ledger");
        XLSX.writeFile(wb, "Bobo_OS_Analytics_2026.xlsx");
    };

    // Helper for category display
    const getTopByCategory = (cat) => {
        return (data.topProducts || []).filter(p => {
            const c = p.category?.toLowerCase() || '';
            const search = cat.toLowerCase();
            return c.includes(search);
        }).slice(0, 3);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-32 pb-40">
           {/* PROTOCOL HEADER */}
           <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-3xl mb-8">
                <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">System 2.3 ULTRA | Demo Channel Active</span>
                </div>
                <button onClick={() => window.location.reload()} className="text-[8px] font-black uppercase text-orange-400 hover:text-white underline italic">Force Mirror Refresh</button>
            </div>

            {isDemo && (
                <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white px-8 py-4 rounded-[32px] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl animate-pulse italic flex items-center justify-between border-b-4 border-orange-900/40">
                    <div className="flex items-center gap-4">
                        <Zap className="w-5 h-5 fill-white" /> 
                        PORTAL PREVIEW: CLIENT PRESENTATION DATA SYNCED
                    </div>
                </div>
            )}

            {/* ── PERIOD OVERVIEW ──────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {[
                    { label: 'Today', val: data.periods.daily, color: 'text-white' },
                    { label: 'Weekly', val: data.periods.weekly, color: 'text-white' },
                    { label: 'Monthly', val: data.periods.monthly, color: 'text-white' },
                    { label: 'Yearly', val: data.periods.yearly, color: 'text-orange-500' },
                ].map((p, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[40px] p-8 hover:bg-white/[0.08] transition-all group">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest italic block mb-4">{p.label} Yield</span>
                        <h4 className={`text-2xl md:text-3xl lg:text-4xl font-black italic tracking-tighter ${p.color}`}>
                            ₹{(Number(p.val) || 0).toLocaleString()}
                        </h4>
                    </div>
                ))}
            </div>

            {/* ── REVENUE CHANNEL MATRIX ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[48px] p-10 relative overflow-hidden group shadow-2xl">
                    <div className="flex justify-between items-start md:items-end mb-12">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Yield Trajectory</h3>
                            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest italic mt-2">Profits: <span className="text-emerald-400">Emerald Matrix</span> | Stabil: <span className="text-orange-400">Orange</span></p>
                        </div>
                        <button onClick={downloadExcel} className="hidden md:flex px-6 py-4 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10 hover:bg-white hover:text-black transition-all italic items-center gap-3">
                           <Activity className="w-4 h-4 text-emerald-400" /> Export Excel
                        </button>
                    </div>

                    <div className="h-[250px] flex items-end justify-between gap-1 relative z-10">
                        {(data.dailySales || []).map((day, i) => {
                            const max = 10000;
                            const h = Math.min(((Number(day.total) || 0) / max) * 100, 100);
                            const isPeak = day.total > 7000;
                            const isSelected = selectedDate === day.date;

                            return (
                                <div key={i} onMouseEnter={() => setSelectedDate(day.date)} className="flex-1 group/bar relative h-full flex flex-col justify-end cursor-pointer">
                                    <div className={`absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-xl text-[10px] font-black text-black transition-all pointer-events-none z-50 italic shadow-2xl ${isSelected ? 'opacity-100 scale-110' : 'opacity-0'}`}>
                                        <div className="text-[8px] opacity-40 uppercase mb-1">{day.date}</div>
                                        ₹{Math.round(day.total).toLocaleString()}
                                    </div>
                                    <div 
                                        style={{ height: `${h}%`, minHeight: '8px' }} 
                                        className={`w-full rounded-2xl transition-all duration-700 ${isSelected ? 'ring-2 ring-white scale-x-110 opacity-100' : 'opacity-40 group-hover/bar:opacity-80'} ${isPeak ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-orange-500'}`}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-8 text-[8px] font-black uppercase text-white/20 tracking-[0.4em] italic border-t border-white/5 pt-4">
                        <span>30 Days Ago</span>
                        <span>Today</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 relative overflow-hidden group shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                       <h3 className="text-xl font-black italic uppercase tracking-tighter text-orange-400">Ledger Matrix</h3>
                       <Calendar className="w-5 h-5 text-white/20" />
                    </div>
                    {/* MINI CALENDAR GRID */}
                    <div className="grid grid-cols-7 gap-2 mb-12">
                        {Array.from({length: 30}).map((_, i) => {
                            const d = data.dailySales[i] || { date: '', total: 0 };
                            const isActive = selectedDate === d.date;
                            const isPeak = d.total > 7000;
                            return (
                                <div 
                                    key={i} 
                                    onMouseEnter={() => setSelectedDate(d.date)}
                                    className={`aspect-square rounded-lg cursor-pointer transition-all border border-white/5 ${isActive ? 'scale-110 ring-2 ring-white z-10' : ''} ${isPeak ? 'bg-emerald-500' : 'bg-white/10'}`}
                                ></div>
                            );
                        })}
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-[8px] font-black uppercase text-white/20 italic tracking-widest">Selected Performance</p>
                        <p className="text-3xl font-black italic text-white tracking-tighter">{selectedDate || '---'}</p>
                        <p className="text-xl font-black text-emerald-400 italic">₹{(Number(data.dailySales.find(d => d.date === selectedDate)?.total) || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* ── CATEGORY LEADERS ────────────────────────────── */}
            <div className="relative">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Category <span className="text-orange-500">Yield Leadership</span></h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {['Starter', 'Main Course', 'Fast Food', 'Dessert', 'Beverage'].map((cat, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/[0.08] transition-all group/col h-full flex flex-col justify-between">
                            <div className="flex items-center gap-3 mb-8">
                                <div className={`w-8 h-8 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center font-black italic`}>
                                    {i + 1}
                                </div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest italic">{cat}</h5>
                            </div>
                            <div className="space-y-3 flex-1">
                                {getTopByCategory(cat).map((it, idx) => (
                                    <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 group/row hover:border-white/10 transition-all">
                                        <p className="text-[10px] font-black uppercase italic tracking-tight text-white/80 transition-colors group-hover/row:text-white truncate">{it.name}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[8px] font-black text-white/30 italic">{it.sales_count} Sales</span>
                                            <span className="text-[10px] font-black text-orange-500 italic">₹{Number(it.total_revenue).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatrixAnalytics;
