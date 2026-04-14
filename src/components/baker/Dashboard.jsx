import React, { useState, useEffect } from 'react';
import { 
    LayoutGrid, Package, Calendar, BookOpen, Calculator, BarChart3, Users, Settings, 
    Pizza, ArrowUpRight, TrendingUp, AlertTriangle, Layers, Clock, ShoppingCart, Star,
    Coffee, ChevronRight, Zap, Target, Search, Plus
} from 'lucide-react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white/5 border border-white/10 rounded-[40px] p-8 shadow-2xl backdrop-blur-xl transition-all hover:bg-white/10 ${className}`}>
        {children}
    </div>
);

const BakersDashboard = () => {
    const [activeTab, setActiveTab] = useState('ops'); // 'ops' vs 'market'
    const [stats, setStats] = useState({
        totalOrders: 142,
        activeBakes: 12,
        revenue: "₹42,850",
        wastage: "4.2%"
    });

    return (
        <div className="space-y-12 animate-in fade-in duration-700 font-['Plus_Jakarta_Sans']">
            
            {/* STAGE 1: BAKER INTELLIGENCE HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Baker <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Intelligence</span></h1>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-4 italic">Neural Command Center | Real-time Batch Monitoring</p>
                </div>

                <div className="flex bg-white/5 p-2 rounded-[30px] border border-white/10 shadow-xl">
                    <button 
                        onClick={() => setActiveTab('ops')}
                        className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'ops' ? 'bg-orange-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Live Batch Ops
                    </button>
                    <button 
                        onClick={() => setActiveTab('market')}
                        className={`px-8 py-3 rounded-[24px] text-[10px] font-black uppercase tracking-widest italic transition-all ${activeTab === 'market' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        Market Insights
                    </button>
                </div>
            </div>

            {/* STAGE 2: NEURAL PULSE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <Card className="border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                            <Layers className="text-orange-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">+12% vs LW</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase italic tracking-widest mb-1">Active Batch Load</p>
                    <h2 className="text-3xl font-black text-white italic">{stats.activeBakes} <span className="text-sm font-normal text-white/30">SKUs</span></h2>
                </Card>

                <Card className="border-l-4 border-l-rose-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                            <TrendingUp className="text-rose-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">High Yield</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase italic tracking-widest mb-1">Total Revenue Node</p>
                    <h2 className="text-3xl font-black text-white italic">{stats.revenue}</h2>
                </Card>

                <Card className="border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                            <ShoppingCart className="text-indigo-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">Live Feed</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase italic tracking-widest mb-1">Orders Fulfilled</p>
                    <h2 className="text-3xl font-black text-white italic">{stats.totalOrders} <span className="text-sm font-normal text-white/30">Ledgers</span></h2>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="text-amber-500 w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">Alert</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase italic tracking-widest mb-1">Wastage Efficiency</p>
                    <h2 className="text-3xl font-black text-white italic">{stats.wastage} <span className="text-sm font-normal text-white/30">Loss Index</span></h2>
                </Card>
            </div>

            {/* STAGE 3: DATA MATRICES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* COLUMN 1 & 2: MAIN VISUALS */}
                <div className="lg:col-span-2 space-y-10">
                    <Card className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-white">Bake Load <span className="text-orange-500">Velocity</span></h3>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1 italic">7-Day Production Matrix</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-600 transition-all"><Search className="w-4 h-4" /></button>
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-600 transition-all"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="h-[300px] flex items-end gap-6 pb-4">
                            {[65, 45, 80, 55, 95, 70, 85].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                    <div 
                                        style={{ height: `${h}%` }}
                                        className="w-full bg-white/5 rounded-2xl relative overflow-hidden transition-all group-hover/bar:bg-orange-600/20"
                                    >
                                        <div 
                                            style={{ height: '100%' }}
                                            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-orange-600 to-orange-400 opacity-60 rounded-2xl transition-all group-hover/bar:opacity-100"
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-white/20 uppercase italic">Day 0{i+1}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <Card>
                            <h3 className="text-lg font-black italic uppercase text-white mb-6 flex items-center gap-3">
                                <Target className="w-5 h-5 text-indigo-400" /> Catalog Leadership
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { name: "Artisan Sourdough", share: 42, color: "bg-indigo-500" },
                                    { name: "French Croissants", share: 28, color: "bg-orange-500" },
                                    { name: "Custom B-Day Cakes", share: 18, color: "bg-rose-500" },
                                    { name: "Danish Pastries", share: 12, color: "bg-emerald-500" }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase italic">
                                            <span className="text-white/60">{item.name}</span>
                                            <span className="text-white">{item.share}% Yield</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${item.share}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-black italic uppercase text-white mb-6 flex items-center gap-3">
                                <Zap className="w-5 h-5 text-amber-400" /> Neural Wastage Alert
                            </h3>
                            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-4">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="text-amber-500 w-6 h-6 mt-1" />
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase italic tracking-tight">Ingredient Surplus Leak</p>
                                        <p className="text-[10px] text-white/40 leading-relaxed mt-1 italic">Vercel AI detected high usage of Valrhona Chocolate with low output yield in Batch #422.</p>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-amber-500/20 rounded-2xl text-[9px] font-black uppercase text-amber-500 tracking-widest hover:bg-amber-500 transition-all hover:text-white">Recalibrate Recipe Lab</button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* COLUMN 3: AI INTELLIGENCE & RECENT FEED */}
                <div className="space-y-10">
                    <Card className="bg-gradient-to-br from-indigo-900/20 to-transparent border-indigo-500/30">
                        <h3 className="text-xl font-black italic uppercase text-indigo-400 mb-8 flex items-center gap-3">
                            <Zap className="w-5 h-5" /> Neural Insights
                        </h3>
                        <div className="space-y-8">
                            <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Profit Surge Prediction</p>
                                <p className="text-[11px] font-black italic text-white uppercase leading-tight">Demand for <span className="text-indigo-400">Vegan Cookies</span> predicted to spike +40% this weekend.</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                                <p className="text-[8px] font-black text-rose-400 uppercase tracking-[0.3em] mb-3">Supply Chain Alert</p>
                                <p className="text-[11px] font-black italic text-white uppercase leading-tight">Butter prices rising +8% in local nodes. Recommend <span className="text-rose-400">Batch Pre-Buy</span> today.</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3">Staff Efficiency</p>
                                <p className="text-[11px] font-black italic text-white uppercase leading-tight">Baker Node 01 performing at <span className="text-emerald-400">98% efficiency</span> in wholesale Fulfilment.</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-black italic uppercase text-white mb-8 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-500" /> Active Pipeline
                        </h3>
                        <div className="space-y-4">
                            {[
                                { id: "ORD-991", client: "Aria Heights", status: "Baking", color: "text-orange-500" },
                                { id: "ORD-988", client: "The Grand Hyatt", status: "Cooling", color: "text-indigo-400" },
                                { id: "ORD-982", client: "Local Retail", status: "Packing", color: "text-emerald-400" },
                                { id: "ORD-977", client: "Sarah J.", status: "Ready", color: "text-white/40" }
                            ].map((ord, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                                    <div>
                                        <p className="text-[10px] font-black text-white italic">{ord.id}</p>
                                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-black">{ord.client}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[10px] font-black uppercase italic ${ord.color}`}>{ord.status}</p>
                                        <ChevronRight className="w-3 h-3 text-white/10 ml-auto mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase text-white/40 tracking-[0.3em] hover:text-white transition-all">Open Full Pipeline Hub</button>
                    </Card>
                </div>

            </div>

        </div>
    );
};

export default BakersDashboard;
