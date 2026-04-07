import React, { useState, useEffect } from 'react';
import { Settings, Shield, Globe, MapPin, Receipt, Camera, Save, Zap, DollarSign, Clock, Users, CreditCard, Users2 } from 'lucide-react';
import FinanceMaster from './FinanceMaster';
import ScheduleMaster from './ScheduleMaster';
import StaffManager from './StaffManager';

const SettingsNode = () => {
    const [activeTab, setActiveTab] = useState('identity');
    const [config, setConfig] = useState({
        name: 'Grand Cafe Bobo',
        gst: '27AAACB1234F1Z5',
        address: 'Hustle Hub Tech Park, Bangalore, 560102',
        contact: '+91 99887 76655',
        currency: 'INR (₹)',
        timezone: 'Asia/Kolkata (IST)',
        logo: null
    });

    useEffect(() => {
        const saved = localStorage.getItem('ro_identity');
        if (saved) setConfig(JSON.parse(saved));
    }, []);

    const saveConfig = () => {
        localStorage.setItem('ro_identity', JSON.stringify(config));
        alert("🏢 IDENTITY PROTOCOL UPDATED | SYNCING NODES...");
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-32 font-['Plus_Jakarta_Sans']">
            
            {/* COMPACT NAV TABS - UNIFIED MANAGEMENT HUB */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 bg-white/5 p-4 rounded-[40px] border border-white/10 shadow-2xl">
                <button 
                    onClick={() => setActiveTab('identity')}
                    className={`px-4 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest italic transition-all flex flex-col items-center gap-2 ${activeTab === 'identity' ? 'bg-orange-600 text-white shadow-xl' : 'text-white/20 hover:text-white'}`}
                >
                    <Settings className="w-4 h-4" /> <span>Identity</span>
                </button>
                <button 
                    onClick={() => setActiveTab('finance')}
                    className={`px-4 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest italic transition-all flex flex-col items-center gap-2 ${activeTab === 'finance' ? 'bg-emerald-600 text-white shadow-xl' : 'text-white/20 hover:text-white'}`}
                >
                    <DollarSign className="w-4 h-4" /> <span>Revenue</span>
                </button>
                <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest italic transition-all flex flex-col items-center gap-2 ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/20 hover:text-white'}`}
                >
                    <Clock className="w-4 h-4" /> <span>Schedule</span>
                </button>
                <button 
                    onClick={() => setActiveTab('staff')}
                    className={`px-4 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest italic transition-all flex flex-col items-center gap-2 ${activeTab === 'staff' ? 'bg-orange-500 text-white shadow-xl' : 'text-white/20 hover:text-white'}`}
                >
                    <Users className="w-4 h-4" /> <span>Staff</span>
                </button>
                <button 
                    onClick={() => setActiveTab('crm')}
                    className={`px-4 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest italic transition-all flex flex-col items-center gap-2 ${activeTab === 'crm' ? 'bg-indigo-400 text-white shadow-xl' : 'text-white/20 hover:text-white'}`}
                >
                    <Users2 className="w-4 h-4" /> <span>CRM Hub</span>
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    className={`px-4 py-4 rounded-3xl text-[9px] font-black uppercase tracking-widest italic transition-all flex flex-col items-center gap-2 ${activeTab === 'billing' ? 'bg-rose-600 text-white shadow-xl' : 'text-white/20 hover:text-white'}`}
                >
                    <CreditCard className="w-4 h-4" /> <span>Billing</span>
                </button>
            </div>

            {activeTab === 'identity' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-5 duration-500">
                    <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Identity <span className="bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent text-5xl">Node</span></h1>
                                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic leading-none">Terminal Configuration | Global ID Management</p>
                            </div>
                            <button onClick={saveConfig} className="hidden md:flex px-10 py-5 bg-orange-600 rounded-3xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-orange-600/30 hover:scale-[1.05] transition-all items-center gap-3 text-white border border-white/10">
                                <Save className="w-4 h-4" /> Deploy Identity Pulse
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* BRAND NODE */}
                        <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                            <h3 className="text-xl font-black italic uppercase text-orange-400 flex items-center gap-3">
                                <Zap className="w-5 h-5" /> Brand Logic
                            </h3>
                            
                            <div 
                                onClick={() => document.getElementById('logoInput').click()}
                                className="flex flex-col items-center justify-center p-8 bg-black/40 border border-white/5 rounded-[40px] border-dashed group cursor-pointer hover:border-orange-500/30 transition-all"
                            >
                                <input 
                                    id="logoInput"
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setConfig({...config, logo: reader.result});
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                                    {config.logo ? <img src={config.logo} className="w-full h-full object-cover shadow-2xl" /> : <Camera className="w-8 h-8" />}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Select Restaurant Logo</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block tracking-widest">Terminal Hub Name</label>
                                    <input 
                                        value={config.name}
                                        onChange={(e) => setConfig({...config, name: e.target.value})}
                                        type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all uppercase" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block tracking-widest">GST IN/TAX ID</label>
                                        <input 
                                            value={config.gst}
                                            onChange={(e) => setConfig({...config, gst: e.target.value})}
                                            type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all uppercase" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block tracking-widest">Currency Node</label>
                                        <input 
                                            value={config.currency}
                                            onChange={(e) => setConfig({...config, currency: e.target.value})}
                                            type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all uppercase" 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* DUAL ACTION NODE */}
                            <div className="pt-6 border-t border-white/5">
                                <button onClick={saveConfig} className="w-full py-5 bg-orange-600 rounded-3xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-orange-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-white border border-white/10">
                                    <Save className="w-4 h-4" /> Deploy Identity Pulse
                                </button>
                            </div>
                        </div>

                        {/* LOCATION & OPS NODE */}
                        <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 space-y-8 shadow-2xl">
                            <h3 className="text-xl font-black italic uppercase text-indigo-400 flex items-center gap-3">
                                <Globe className="w-5 h-5" /> Operational Matrix
                            </h3>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block flex items-center gap-2 tracking-widest">
                                        <MapPin className="w-3 h-3" /> Branch Physical Address
                                    </label>
                                    <textarea 
                                        value={config.address}
                                        onChange={(e) => setConfig({...config, address: e.target.value})}
                                        rows="4" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all resize-none uppercase"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block flex items-center gap-2 tracking-widest">
                                        <Shield className="w-3 h-3" /> Primary Auth Contact
                                    </label>
                                    <input 
                                        value={config.contact}
                                        onChange={(e) => setConfig({...config, contact: e.target.value})}
                                        type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all uppercase" 
                                    />
                                </div>
                                
                                <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[32px]">
                                    <p className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2 mb-2 tracking-widest">
                                        <Globe className="w-3 h-3" /> Time-Sync Node
                                    </p>
                                    <p className="text-[12px] font-black italic text-white uppercase tracking-tight">System is synchronized with {config.timezone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'finance' && <div className="animate-in slide-in-from-bottom-5 duration-500"><FinanceMaster /></div>}
            {activeTab === 'schedule' && <div className="animate-in slide-in-from-bottom-5 duration-500"><ScheduleMaster /></div>}
            {activeTab === 'staff' && <div className="animate-in slide-in-from-bottom-5 duration-500"><StaffManager /></div>}
            
            {activeTab === 'crm' && (
                <div className="animate-in slide-in-from-bottom-5 duration-500 p-20 text-center bg-white/5 border border-white/10 rounded-[48px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10"></div>
                    <div className="w-20 h-20 bg-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-indigo-400/20"><Users2 className="w-10 h-10 text-white" /></div>
                    <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-4">Customer <span className="text-indigo-400 font-bold">CRM HUB</span></h1>
                    <p className="text-[10px] font-black uppercase italic text-white/30 tracking-[0.3em] max-w-md mx-auto mb-10">Intelligent Guest Matrix | Data Mining & Loyalty Protocol Operational</p>
                    <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-not-allowed grayscale">
                            <p className="text-[10px] font-black text-white italic mb-2">GOLD MEMBERS</p>
                            <p className="text-3xl font-black text-white">422</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-not-allowed grayscale">
                            <p className="text-[10px] font-black text-white italic mb-2">DIRECT LEADS</p>
                            <p className="text-3xl font-black text-white">1,084</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-not-allowed grayscale">
                            <p className="text-[10px] font-black text-white italic mb-2">RETENTION</p>
                            <p className="text-3xl font-black text-white">88%</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="animate-in slide-in-from-bottom-5 duration-500 p-20 text-center bg-white/5 border border-white/10 rounded-[48px] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-600/5 to-transparent -z-10"></div>
                    <div className="w-20 h-20 bg-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-rose-600/20"><CreditCard className="w-10 h-10 text-white" /></div>
                    <h1 className="text-4xl font-black italic uppercase text-white tracking-tighter mb-4">Billing & <span className="text-rose-500 font-bold">Plan Hub</span></h1>
                    <p className="text-[10px] font-black uppercase italic text-white/30 tracking-[0.3em] max-w-md mx-auto mb-10 italic">Financial Ledger Protocol | Active Subscription: ENTERPRISE SUPREME</p>
                    <div className="p-10 bg-black/40 rounded-[40px] border border-white/10 max-w-xl mx-auto">
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-8">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-white/40 uppercase mb-2">Current Plan Status</p>
                                <p className="text-xl font-black text-emerald-400 italic uppercase italic">Operational: ACTIVE</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white/40 uppercase mb-2">Next Renewal</p>
                                <p className="text-xl font-black text-white/80 italic">MAY 20, 2026</p>
                            </div>
                        </div>
                        <button className="w-full py-6 bg-rose-600 rounded-3xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-rose-600/30 hover:scale-[1.05] transition-all text-white">Upgrade Secondary Nodes</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SettingsNode;
