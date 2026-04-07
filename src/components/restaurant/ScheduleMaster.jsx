import React, { useState } from 'react';
import { Calendar, Clock, Zap, Plus, Trash2, Edit3, Settings, Play, Pause, ChevronRight } from 'lucide-react';

const ScheduleMaster = () => {
    const [schedules, setSchedules] = useState([
        { id: 1, name: 'Breakfast Protocol', start: '06:00 AM', end: '11:00 AM', days: ['Mon-Fri'], target: 'Breakfast Category', state: 'active' },
        { id: 2, name: 'Lunch Rush', start: '12:00 PM', end: '03:00 PM', days: ['Daily'], target: 'Full Menu', state: 'active' },
        { id: 3, name: 'Elite Late Night', start: '11:00 PM', end: '03:00 AM', days: ['Fri-Sat'], target: 'Beverages', state: 'inactive' }
    ]);

    const [dynamicPricing, setDynamicPricing] = useState([
        { id: 1, name: 'Happy Hour - Beer', modifier: '-20%', start: '05:00 PM', end: '07:00 PM', active: true },
        { id: 2, name: 'Late Night Surge', modifier: '+15%', start: '11:00 PM', end: '05:00 AM', active: false }
    ]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-32 font-['Plus_Jakarta_Sans']">
            
            <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-2xl">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Schedule <span className="bg-gradient-to-r from-orange-500 to-amber-300 bg-clip-text text-transparent text-5xl">MASTER</span></h1>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic leading-none">Temporal Menu Control | Time-Bound Inventory Nodes Active</p>
                    </div>
                    <div className="w-16 h-16 bg-orange-500/10 rounded-3xl flex items-center justify-center border border-orange-500/20 shadow-2xl">
                        <Clock className="text-orange-500 w-8 h-8" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* MENU BINDING (TIME-BOUND) */}
                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden border-orange-500/10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black italic uppercase text-orange-400 flex items-center gap-4">
                                <Calendar className="w-6 h-6" /> Menu Schedules
                            </h3>
                            <button className="p-3 bg-orange-600 rounded-xl text-white hover:scale-105 transition-all"><Plus className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-6">
                            {schedules.map(sch => (
                                <div key={sch.id} className="group relative p-8 bg-white/5 border border-white/10 rounded-[32px] hover:bg-orange-500/5 hover:border-orange-500/30 transition-all flex items-center justify-between overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"><Edit3 className="w-4 h-4 text-white" /></button>
                                            <button className="p-2 bg-rose-500/10 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-8">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${sch.state === 'active' ? 'bg-orange-600 border-orange-400 shadow-xl shadow-orange-600/20' : 'bg-white/5 border-white/10 grayscale opacity-40'}`}>
                                            {sch.state === 'active' ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black uppercase italic text-white tracking-widest">{sch.name}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                                                    <Clock className="w-3 h-3 text-orange-500" />
                                                    <span className="text-[8px] font-black italic text-white/60 tracking-widest uppercase">{sch.start} - {sch.end}</span>
                                                </div>
                                                <span className="text-[8px] font-black text-orange-500/80 uppercase italic tracking-widest">{sch.days}</span>
                                            </div>
                                            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20 mt-3 italic flex items-center gap-2">
                                                NODE BINDING: <span className="text-white/60">{sch.target}</span> <ChevronRight className="w-2 h-2 text-white/10" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* DYNAMIC PRICE SHIFTING */}
                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden border-orange-500/10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black italic uppercase text-orange-400 flex items-center gap-4">
                                <Zap className="w-6 h-6" /> Dynamic Pricing
                            </h3>
                            <button className="p-3 bg-orange-600 rounded-xl text-white hover:scale-105 transition-all"><Plus className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-6">
                            {dynamicPricing.map(dp => (
                                <div key={dp.id} className="p-8 bg-black/40 rounded-[32px] border border-white/5 hover:border-orange-500/30 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-8">
                                        <div className={`text-2xl font-black italic italic uppercase flex items-center justify-center transition-all ${dp.active ? 'text-orange-500 shadow-orange-500/20' : 'text-white/10 grayscale'}`}>
                                            {dp.modifier}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black uppercase italic text-white tracking-widest">{dp.name}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[8px] font-black bg-orange-600/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest italic">{dp.start} - {dp.end}</span>
                                                <span className="text-[7px] font-black uppercase italic tracking-[0.2em] text-white/10">ACTIVE STATE: <span className={dp.active ? 'text-emerald-500' : 'text-rose-500'}>{dp.active ? 'ENABLED' : 'DISABLED'}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${dp.active ? 'bg-orange-600' : 'bg-white/10'}`}>
                                        <div className={`absolute top-1.5 w-3 h-3 rounded-full bg-white transition-all ${dp.active ? 'right-1.5' : 'left-1.5'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 p-8 bg-white/5 rounded-3xl border border-white/5 border-dashed flex items-center gap-6">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center"><Settings className="w-6 h-6 text-orange-500" /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase italic text-white">Global Pricing Override</p>
                                <p className="text-[8px] font-black uppercase text-white/20 italic tracking-widest mt-1">Status: Operational Matrix Synchronized</p>
                            </div>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default ScheduleMaster;
