import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, Calculator, Globe, Clock, Settings, Plus, Trash2, Zap, AlertCircle, Save } from 'lucide-react';

const FinanceMaster = () => {
    const [surcharges, setSurcharges] = useState([
        { id: 1, name: 'Late Night Surge', value: 15, type: 'percent', trigger: 'After 11:00 PM', active: true },
        { id: 2, name: 'Standard Delivery', value: 10, type: 'flat', trigger: 'Delivery Orders', active: true }
    ]);

    const [discounts, setDiscounts] = useState([
        { id: 1, name: 'First Order', value: 10, type: 'percent', scope: 'Order Level', active: true },
        { id: 2, name: 'Happy Hour Drink', value: 2, type: 'flat', scope: 'Item Level', active: false }
    ]);

    const [isoFeeMode, setIsoFeeMode] = useState('pass_on'); // pass_on or absorb
    const [loading, setLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings/restaurant_finance');
                if (res.ok) {
                    const data = await res.json();
                    if (data.surcharges) setSurcharges(data.surcharges);
                    if (data.discounts) setDiscounts(data.discounts);
                    if (data.isoFeeMode) setIsoFeeMode(data.isoFeeMode);
                }
            } catch (e) {
                console.error("Finance Settings Sync Error:", e);
                const local = localStorage.getItem('ro_finance_settings');
                if (local) {
                    const data = JSON.parse(local);
                    setSurcharges(data.surcharges);
                    setDiscounts(data.discounts);
                    setIsoFeeMode(data.isoFeeMode);
                }
            }
        };
        fetchSettings();
    }, []);

    const saveSettings = async (currentIsoMode = isoFeeMode) => {
        setLoading(true);
        const settings = { surcharges, discounts, isoFeeMode: currentIsoMode };
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId: 'restaurant_finance', settings })
            });
            if (res.ok) {
                setLastSaved(new Date().toLocaleTimeString());
                localStorage.setItem('ro_finance_settings', JSON.stringify(settings));
            }
        } catch (e) {
            console.error("Failed to save finance settings:", e);
            localStorage.setItem('ro_finance_settings', JSON.stringify(settings));
        } finally {
            setLoading(false);
        }
    };

    const toggleIsoMode = (mode) => {
        setIsoFeeMode(mode);
        saveSettings(mode);
    };

    const toggleDiscount = (id) => {
        const updated = discounts.map(d => d.id === id ? { ...d, active: !d.active } : d);
        setDiscounts(updated);
        // We'll call save later or on a debounced basis, for now let's use a manual save button too
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-32 font-['Plus_Jakarta_Sans']">
            
            <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10 group-hover:bg-emerald-500/10 transition-all"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none flex items-center gap-6">
                            Finance <span className="bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent text-5xl">MASTER</span>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                                <DollarSign className="text-emerald-500 w-6 h-6" />
                            </div>
                        </h1>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic leading-none">Global Profit Controller | Compliant ISO Nodes Active</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {lastSaved && <span className="text-[9px] font-black uppercase text-emerald-400 italic">Last Sync: {lastSaved}</span>}
                        <button 
                            onClick={() => saveSettings()} 
                            disabled={loading}
                            className="px-8 py-4 bg-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-emerald-600/30 hover:scale-[1.05] transition-all flex items-center gap-3 text-white disabled:opacity-50"
                        >
                            {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Deploy Protocol
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* SURCHARGES & ISO FEES */}
                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black italic uppercase text-emerald-400 flex items-center gap-4">
                                <Zap className="w-6 h-6" /> Surcharges & Fees
                            </h3>
                            <button className="p-3 bg-emerald-600 rounded-xl text-white hover:scale-105 transition-all active:scale-95 shadow-lg shadow-emerald-600/20"><Plus className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-4">
                            {surcharges.map(s => (
                                <div key={s.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-emerald-500/30 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center font-black italic text-emerald-500 text-lg">
                                            {s.type === 'percent' ? '%' : '$'}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-white tracking-widest">{s.name}</p>
                                            <p className="text-[8px] font-black uppercase text-white/20 italic tracking-widest mt-1">Rule: {s.trigger}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xl font-black bg-white/5 px-4 py-2 rounded-xl text-white">+{s.value}{s.type === 'percent' ? '%' : ''}</span>
                                        <button className="text-white/10 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5 h-1px"></div>

                        <div className="p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 mt-6 group">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-3">
                                    <Globe className="w-4 h-4" /> ISO PROCESSING PROTOCOL
                                </h4>
                                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase italic tracking-widest transition-all ${isoFeeMode === 'pass_on' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'}`}>
                                    {isoFeeMode === 'pass_on' ? 'REVENUE COMPLIANT' : 'BUSINESS ABSORB'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => toggleIsoMode('pass_on')}
                                    className={`p-6 rounded-2xl border transition-all text-left group ${isoFeeMode === 'pass_on' ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/20' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-2">Dual Surcharing</p>
                                    <p className="text-[8px] font-black uppercase opacity-60 italic">Pass Fees to Customer</p>
                                </button>
                                <button 
                                    onClick={() => toggleIsoMode('absorb')}
                                    className={`p-6 rounded-2xl border transition-all text-left group ${isoFeeMode === 'absorb' ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-600/20' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                >
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-2">Merchant Absorb</p>
                                    <p className="text-[8px] font-black uppercase opacity-60 italic">Business pays processing</p>
                                </button>
                            </div>
                            <div className="mt-6 flex items-center gap-3 text-white/30 p-4 bg-black/20 rounded-2xl border border-white/5">
                                <AlertCircle className="w-4 h-4" />
                                <p className="text-[8px] font-black uppercase tracking-widest italic leading-relaxed">
                                    Logic Update: {isoFeeMode === 'pass_on' ? 'A 3.5% ISO fee will be automatically appended to all digital transactions.' : 'Business will absorb the 3.5% ISO processing cost from net margins.'}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* DISCOUNTS & CAMPAIGNS */}
                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black italic uppercase text-indigo-400 flex items-center gap-4">
                                <Calculator className="w-6 h-6" /> Discount Matrix
                            </h3>
                            <button className="p-3 bg-indigo-600 rounded-xl text-white hover:scale-105 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"><Plus className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-4">
                            {discounts.map(d => (
                                <div key={d.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-indigo-500/30 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-lg transition-all ${d.active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                                            <Zap className={d.active ? "w-5 h-5" : "w-5 h-5 opacity-20"} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none">{d.name}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-[7px] font-black uppercase italic px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">{d.scope}</span>
                                                <span className={`text-[7px] font-black uppercase italic tracking-widest ${d.active ? 'text-indigo-400' : 'text-white/20'}`}>{d.active ? 'ACTIVE NODE' : 'INACTIVE'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`text-xl font-black italic ${d.active ? 'text-indigo-400' : 'text-white/20'}`}>-{d.value}{d.type === 'percent' ? '%' : '$'}</span>
                                        <div 
                                            onClick={() => toggleDiscount(d.id)}
                                            className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${d.active ? 'bg-indigo-600' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-md transition-all ${d.active ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-8 bg-black/40 rounded-3xl border border-white/5 border-dashed">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic mb-6">Conditional Logic Matrix</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {['BOGO DEPLOY', 'HAPPY HOUR', 'BULK ORDER'].map(tag => (
                                    <div key={tag} className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center text-[8px] font-black uppercase italic text-white/40 hover:text-indigo-400 hover:border-indigo-500/30 cursor-pointer transition-all">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default FinanceMaster;
