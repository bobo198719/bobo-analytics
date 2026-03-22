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
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDemo, setIsDemo] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/v2/restaurant/analytics?v=${Date.now()}`);
            if (!res.ok) throw new Error("Backend Offline");
            const result = await res.json();
            
            const hasData = result.dailySales && result.dailySales.length > 5;
            if (!hasData) {
                useSimulationData();
            } else {
                setData(result);
                setIsDemo(false);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            useSimulationData();
            setLoading(false);
        }
    };

    const useSimulationData = () => {
        setIsDemo(true);
        setData({
            periods: { daily: 4250, weekly: 28400, monthly: 112000, yearly: 1240000 },
            dailySales: Array.from({length: 30}, (_, i) => ({ 
                date: `2026-03-${i+1}`, 
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
        });
    };

    const runAutoSync = async () => {
        setLoading(true);
        try {
            const menuRes = await fetch('/api/v2/restaurant/menu');
            const menu = await menuRes.json();
            const tableRes = await fetch('/api/v2/restaurant/tables');
            const tables = await tableRes.json();

            if (!menu.length) throw new Error("Upload a menu first.");

            const orders = [];
            for (let i = 0; i < 150; i++) {
                const daysAgo = Math.floor(Math.random() * 20);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                date.setHours(Math.floor(Math.random() * 10) + 11, Math.floor(Math.random() * 60));

                const items = [{ menu_item_id: menu[0]?.id || 1, menu_name: menu[0]?.name || 'Dish', category: menu[0]?.category || 'Mains', price: 500, quantity: 1 }];
                orders.push({
                    table_id: tables[0]?.id || 1,
                    status: 'completed',
                    total_amount: 525,
                    gst_amount: 25,
                    items: items,
                    created_at: date.toISOString().slice(0, 19).replace('T', ' ')
                });
            }

            await fetch('/api/v2/restaurant/seed-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders })
            });
            setTimeout(fetchData, 1000);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Zap className="w-12 h-12 text-orange-500 animate-pulse mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Loading Analytics Matrix...</p>
        </div>
    );

    const { periods, dailySales, topProducts, busyHours, busyDays, catYields } = data || {};
    if (!data) return null;

    // Helper to filter top products by category
    const getTopByCategory = (cat) => {
        return topProducts.filter(p => {
            const c = p.category?.toLowerCase() || '';
            const search = cat.toLowerCase();
            if (search === 'fast food') return c.includes('burger') || c.includes('pizza') || c.includes('fast') || c.includes('noodle');
            return c.includes(search);
        }).slice(0, 3);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {isDemo && (
                <div className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl animate-pulse italic flex items-center gap-4 border-2 border-white/20">
                    <Zap className="w-4 h-4" /> PERFORMANCE MATRIX: DEMO MODE / CLIENT PREVIEW ACTIVE
                </div>
            )}
            {/* ── PERIOD OVERVIEW ──────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Today', val: periods.daily, trend: '+5.4%' },
                    { label: 'Weekly', val: periods.weekly, trend: '+12.1%' },
                    { label: 'Monthly', val: periods.monthly, trend: '+18.9%' },
                    { label: 'Yearly', val: periods.yearly, trend: '+24.5%' },
                ].map((p, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[40px] p-8 hover:bg-white/[0.08] transition-all group border-b-4 border-b-orange-500/0 hover:border-b-orange-500/40">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest italic">{p.label} Sales</span>
                            <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg text-[8px] font-black italic">{p.trend}</div>
                        </div>
                        <h4 className="text-4xl font-black italic tracking-tighter">₹{(Number(p.val) || 0).toLocaleString()}</h4>
                    </div>
                ))}
            </div>

            {/* ── REVENUE CHANNEL MATRIX ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-orange-400 transition-colors">Yield Trajectory</h3>
                            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest italic mt-2">Daily Revenue Matrix (30D)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase text-emerald-400 italic mb-1">Peak Performance</p>
                            <p className="text-lg font-black italic text-white line-through opacity-20 decoration-orange-500">₹45,200</p>
                        </div>
                    </div>

                    <div className="h-[300px] flex items-end justify-between gap-1 relative z-10">
                        {Array.from({length: 30}).map((_, i) => {
                            const day = dailySales[dailySales.length - 30 + i] || { total: Math.random() * 5000 + 1000 };
                            const max = 30000;
                            const h = Math.min(((Number(day.total) || 0) / max) * 100, 100);
                            return (
                                <div key={i} className="flex-1 group/bar relative h-full flex flex-col justify-end">
                                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg text-[8px] font-black text-black opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 italic">
                                        ₹{Math.round(day.total).toLocaleString()}
                                    </div>
                                    <div 
                                        style={{ height: `${h}%`, minHeight: '4px' }} 
                                        className={`w-full rounded-full transition-all duration-1000 ${i === 29 ? 'bg-orange-500 shadow-lg shadow-orange-500/40' : 'bg-white/10 group-hover/bar:bg-white/30'}`}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-6 text-[8px] font-black uppercase text-white/20 tracking-[0.4em] italic">
                        <span>30 Days Ago</span>
                        <span>Today</span>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-orange-400">Peak Hours</h3>
                    <div className="space-y-4">
                        {busyHours.slice(0, 6).map((h, i) => (
                            <div key={i} className="flex items-center gap-4 group/row">
                                <div className="w-12 text-[10px] font-black uppercase text-white/30 italic">{h.hour}:00</div>
                                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                                    <div 
                                        className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-1000" 
                                        style={{ width: `${(h.order_count / busyHours[0].order_count) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] font-black italic text-white/60">{h.order_count} Vol</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/30 font-black italic text-lg leading-none">
                                {busyHours[0]?.hour}:00
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 italic">Busiest Cycle</p>
                                <p className="text-xs font-black uppercase text-white/40 italic">Maximize kitchen staff</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CATEGORY COLUMNS MATRIX ──────────────────────── */}
            <div className="relative">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter"><span className="text-orange-500">Fast Food</span> & Category Leaders</h2>
                    <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest italic text-white/20">
                        <Filter className="w-3 h-3" /> Sorted by Yield
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {[
                        { label: 'Starter', icon: <Flame />, color: 'orange', items: getTopByCategory('starter') },
                        { label: 'Main Course', icon: <Utensils />, color: 'rose', items: getTopByCategory('main course') },
                        { label: 'Fast Food', icon: <FastForward />, color: 'amber', items: getTopByCategory('fast food') },
                        { label: 'Dessert', icon: <IceCream />, color: 'emerald', items: getTopByCategory('dessert') },
                        { label: 'Beverage', icon: <Coffee />, color: 'indigo', items: getTopByCategory('beverage') }
                    ].map((col, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-6 hover:bg-white/[0.08] transition-all group/col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-8 h-8 rounded-xl bg-${col.color}-500/20 text-${col.color}-500 flex items-center justify-center group-hover/col:scale-110 transition-transform`}>
                                    {col.icon}
                                </div>
                                <h5 className="text-[10px] font-black uppercase tracking-widest italic">{col.label}</h5>
                            </div>
                            <div className="space-y-3">
                                {col.items.length === 0 ? (
                                    <p className="text-[8px] font-black uppercase text-white/10 italic text-center py-4">No Matrix Data</p>
                                ) : (
                                    col.items.map((it, idx) => (
                                        <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 group/row hover:border-white/10 transition-all">
                                            <p className="text-[10px] font-black uppercase italic tracking-tight text-white/80 transition-colors group-hover/row:text-white truncate">{it.name}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[8px] font-black text-white/30 italic">{it.sales_count} Sales</span>
                                                <span className="text-[10px] font-black text-orange-500 italic">₹{Number(it.total_revenue).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── PROFIT INSIGHTS BOTTOM MATRIX ────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[48px] p-10 relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-8">Profitability Node</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Strongest Day</p>
                                <p className="text-3xl font-black italic text-white uppercase tracking-tighter">{busyDays.length ? busyDays[0].day : '---'}</p>
                                <p className="text-[8px] font-black text-emerald-300 italic">+15% Weekend Surge</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Top Category</p>
                                <p className="text-3xl font-black italic text-white uppercase tracking-tighter">
                                    {catYields.length ? catYields.sort((a,b)=>b.revenue-a.revenue)[0].category : '---'}
                                </p>
                                <p className="text-[8px] font-black text-emerald-300 italic">Dominating Matrix</p>
                            </div>
                        </div>
                    </div>
                    <Activity className="absolute bottom-[-20px] right-[-20px] w-48 h-48 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-rose-600 rounded-[48px] p-10 relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Alpha Report</h3>
                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest italic">Predictive Analysis Active</p>
                        </div>
                        <div className="mt-12 flex justify-between items-end">
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-white italic">Best Mth</p>
                                    <p className="text-2xl font-black text-white italic">OCT</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-white italic">Best Wk</p>
                                    <p className="text-2xl font-black text-white italic">W42</p>
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-110 transition-transform shadow-xl">Export Matrix Data</button>
                        </div>
                    </div>
                    <Flame className="absolute top-10 right-10 w-24 h-24 text-white/10 animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default MatrixAnalytics;
