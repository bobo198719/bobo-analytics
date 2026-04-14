import React, { useState, useEffect } from 'react';
import { 
    Users, UserCheck, Star, Trash2, Search, Filter, Mail, Phone, 
    Calendar, TrendingUp, Award, MessageSquare, ChevronRight, MoreHorizontal 
} from 'lucide-react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl transition-all hover:bg-white/10 ${className}`}>
        {children}
    </div>
);

const CRMManager = () => {
    const [customers, setCustomers] = useState([
        { id: 1, name: "Arjun Verma", email: "arjun@example.com", phone: "+91 98765 43210", visits: 12, spend: "₹14,200", favorite: "Tandoori Chicken", points: 450, tier: "Gold" },
        { id: 2, name: "Priya Sharma", email: "priya.s@example.com", phone: "+91 91234 56789", visits: 8, spend: "₹9,800", favorite: "Paneer Butter Masala", points: 280, tier: "Silver" },
        { id: 3, name: "Rahul Kapoor", email: "rahul.k@example.com", phone: "+91 88888 77777", visits: 24, spend: "₹38,500", favorite: "Mutton Biryani", points: 1200, tier: "Platinum" },
        { id: 4, name: "Sanya Gupta", email: "sanya.g@example.com", phone: "+91 77777 66666", visits: 5, spend: "₹4,100", favorite: "Dal Makhani", points: 150, tier: "Bronze" }
    ]);

    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* HUB HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase italic text-white flex items-center gap-4">
                        Guest <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">Intelligence Hub</span>
                    </h1>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] italic leading-none">Global CRM Terminal | Personalized Loyalty Engine</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="SEARCH BY GUEST NAME..."
                            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-orange-500/50 w-72"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="px-8 py-4 bg-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:scale-105 transition-all">
                        + New Profile
                    </button>
                </div>
            </div>

            {/* ANALYTIC STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-orange-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                            <Users className="text-orange-500 w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">+14</span>
                    </div>
                    <p className="text-white/40 text-[9px] font-black uppercase italic tracking-widest">Total Guest Ledger</p>
                    <h2 className="text-2xl font-black text-white italic mt-1">1,280</h2>
                </Card>

                <Card className="border-l-4 border-l-rose-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
                            <Award className="text-rose-500 w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-white/40 bg-white/5 px-2 py-1 rounded-lg">LIVE</span>
                    </div>
                    <p className="text-white/40 text-[9px] font-black uppercase italic tracking-widest">Active Members</p>
                    <h2 className="text-2xl font-black text-white italic mt-1">452</h2>
                </Card>

                <Card className="border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-indigo-500 w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">82%</span>
                    </div>
                    <p className="text-white/40 text-[9px] font-black uppercase italic tracking-widest">Retention Index</p>
                    <h2 className="text-2xl font-black text-white italic mt-1">Strong</h2>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <MessageSquare className="text-emerald-500 w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">4.9</span>
                    </div>
                    <p className="text-white/40 text-[9px] font-black uppercase italic tracking-widest">Sentiment Score</p>
                    <h2 className="text-2xl font-black text-white italic mt-1">Exceptional</h2>
                </Card>
            </div>

            {/* GUEST MATRIX TABLE */}
            <Card className="p-0 overflow-hidden bg-black/40">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-black italic uppercase text-white tracking-widest">Master Guest Matrix</h3>
                    <div className="flex gap-4">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-all"><Filter className="w-4 h-4 text-white/40" /></button>
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-all"><Mail className="w-4 h-4 text-white/40" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Guest Profile</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Contact Node</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Engagement</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Total Spend</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Favorite SKU</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-white/30 tracking-widest">Tier</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-white/30 tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {customers.map((guest) => (
                                <tr key={guest.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-black text-orange-500 italic">
                                                {guest.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black italic text-white uppercase">{guest.name}</p>
                                                <p className="text-[9px] text-white/20 font-bold uppercase italic">ID: B-CRM-{guest.id}00</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-white font-medium flex items-center gap-2"><Mail className="w-3 h-3 text-white/20" /> {guest.email}</p>
                                            <p className="text-[10px] text-white/60 flex items-center gap-2"><Phone className="w-3 h-3 text-white/20" /> {guest.phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold italic text-white">{guest.visits} Visits</td>
                                    <td className="px-8 py-6 text-sm font-black text-rose-500 italic">{guest.spend}</td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase italic text-white/50">{guest.favorite}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase italic tracking-widest ${
                                            guest.tier === 'Platinum' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                            guest.tier === 'Gold' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                            guest.tier === 'Silver' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' :
                                            'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                        }`}>
                                            {guest.tier} Member
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-white transition-all"><MessageSquare className="w-4 h-4" /></button>
                                            <button className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* LOYALTY CAMPAIGN ENGINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 group-hover:bg-indigo-500/10 transition-all"></div>
                    <h3 className="text-xl font-black italic uppercase text-white mb-2">Neural <span className="text-indigo-500">Campaign Engine</span></h3>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic mb-10">AI-Optimized Bulk Engagement</p>
                    
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[32px] border border-white/5">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center"><Calendar className="text-indigo-400" /></div>
                            <div className="flex-1">
                                <p className="text-sm font-black italic uppercase text-white leading-none">Weekend Surge Invite</p>
                                <p className="text-[10px] text-white/40 mt-1 italic">Targeting 452 High-Retention guests for Friday night.</p>
                            </div>
                            <button className="px-6 py-2 bg-indigo-600 rounded-xl text-[9px] font-black uppercase italic">Activate</button>
                        </div>
                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[32px] border border-white/5 opacity-50">
                            <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center"><Award className="text-rose-400" /></div>
                            <div className="flex-1">
                                <p className="text-sm font-black italic uppercase text-white leading-none">VVIP Appreciation Gift</p>
                                <p className="text-[10px] text-white/40 mt-1 italic">Personalized coupon for Platinum and Gold tier.</p>
                            </div>
                            <button className="px-6 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase italic">Scheduled</button>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -z-10 group-hover:bg-rose-500/10 transition-all"></div>
                    <h3 className="text-xl font-black italic uppercase text-white mb-2">Tier <span className="text-rose-500">Intelligence</span></h3>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic mb-10">Loyalty Matrix Visualization</p>
                    
                    <div className="h-48 flex items-end gap-10 px-6">
                        {[40, 75, 55, 30].map((h, i) => (
                            <div key={i} className="flex-1 space-y-4">
                                <div className="relative group/bar h-full flex flex-col justify-end">
                                    <div 
                                        style={{ height: `${h}%` }}
                                        className={`w-full rounded-2xl transition-all duration-1000 ${
                                            i === 0 ? 'bg-orange-500/20 border-orange-500/50 border' :
                                            i === 1 ? 'bg-indigo-500/20 border-indigo-500/50 border' :
                                            i === 2 ? 'bg-amber-500/20 border-amber-500/50 border' :
                                            'bg-slate-500/20 border-slate-500/50 border'
                                        }`}
                                    ></div>
                                </div>
                                <p className="text-[8px] font-black uppercase italic text-center text-white/40 leading-none">
                                    {['Bronze', 'Platinum', 'Gold', 'Silver'][i]}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

        </div>
    );
};

export default CRMManager;
