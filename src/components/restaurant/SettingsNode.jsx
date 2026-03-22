import React, { useState, useEffect } from 'react';
import { Settings, Shield, Globe, MapPin, Receipt, Camera, Save, Zap } from 'lucide-react';

const SettingsNode = () => {
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
        window.location.reload(); // Refresh to update all titles across components
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-32">
            <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Identity <span className="bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent">Node</span></h1>
                        <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em] mt-3 italic">Terminal Configuration | Global ID Management</p>
                    </div>
                    <button onClick={saveConfig} className="px-10 py-5 bg-orange-600 rounded-3xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-orange-600/30 hover:scale-[1.05] transition-all flex items-center gap-3">
                        <Save className="w-4 h-4" /> Deploy Identity Pulse
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* BRAND NODE */}
                <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 space-y-8 shadow-2xl">
                    <h3 className="text-xl font-black italic uppercase text-orange-400 flex items-center gap-3">
                        <Zap className="w-5 h-5" /> Brand Logic
                    </h3>
                    
                    <div className="flex flex-col items-center justify-center p-8 bg-black/40 border border-white/5 rounded-[40px] border-dashed group cursor-pointer hover:border-orange-500/30 transition-all">
                        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4 group-hover:scale-110 transition-transform">
                            {config.logo ? <img src={config.logo} className="w-full h-full rounded-full object-cover" /> : <Camera className="w-8 h-8" />}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Select Restaurant Logo</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block">Terminal Hub Name</label>
                            <input 
                                value={config.name}
                                onChange={(e) => setConfig({...config, name: e.target.value})}
                                type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all" 
                            />
                        </div>
                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block">GST IN/TAX ID</label>
                                    <input 
                                        value={config.gst}
                                        onChange={(e) => setConfig({...config, gst: e.target.value})}
                                        type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block">Currency Node</label>
                                    <input 
                                        value={config.currency}
                                        onChange={(e) => setConfig({...config, currency: e.target.value})}
                                        type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LOCATION & OPS NODE */}
                <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 space-y-8 shadow-2xl">
                    <h3 className="text-xl font-black italic uppercase text-indigo-400 flex items-center gap-3">
                        <Globe className="w-5 h-5" /> Operational Matrix
                    </h3>

                    <div className="space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Branch Physical Address
                            </label>
                            <textarea 
                                value={config.address}
                                onChange={(e) => setConfig({...config, address: e.target.value})}
                                rows="4" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-orange-500 transition-all resize-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Primary Auth Contact
                            </label>
                            <input 
                                value={config.contact}
                                onChange={(e) => setConfig({...config, contact: e.target.value})}
                                type="text" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all" 
                            />
                        </div>
                        
                        <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[32px]">
                            <p className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-2 mb-2">
                                <Globe className="w-3 h-3" /> Time-Sync Node
                            </p>
                            <p className="text-[12px] font-black italic text-white uppercase tracking-tight">System is synchronized with {config.timezone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsNode;
