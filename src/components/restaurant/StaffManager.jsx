import React, { useState } from 'react';
import { Users, Shield, ShieldAlert, Zap, UserPlus, Trash2, Key } from 'lucide-react';

const StaffManager = () => {
    const [staff, setStaff] = useState([
        { id: 1, name: 'Chef Marco', role: 'chef', pin: '2233', status: 'Active' },
        { id: 2, name: 'Sarah Lee', role: 'waiter', pin: '1122', status: 'Active' },
        { id: 3, name: 'Admin Root', role: 'manager', pin: '0000', status: 'Active' }
    ]);

    const [newStaff, setNewStaff] = useState({ name: '', role: 'waiter', pin: '' });

    const addStaff = () => {
        if (!newStaff.name || !newStaff.pin) return alert("Fill all fields");
        setStaff([...staff, { ...newStaff, id: Date.now(), status: 'Active' }]);
        setNewStaff({ name: '', role: 'waiter', pin: '' });
    };

    const deleteStaff = (id) => {
        setStaff(staff.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-32">
            <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Staff <span className="bg-gradient-to-r from-indigo-500 to-indigo-300 bg-clip-text text-transparent">Governance</span></h1>
                    <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em] mt-3 italic">Permission Matrix | Role Assignment Protocol</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 group-hover:bg-indigo-500/10 transition-all"></div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ADD STAFF NODE */}
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 h-fit shadow-2xl">
                    <h3 className="text-xl font-black italic uppercase text-indigo-400 mb-8 flex items-center gap-3">
                        <UserPlus className="w-5 h-5" /> Provision Node
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block">Staff Master Name</label>
                            <input 
                                value={newStaff.name}
                                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                                type="text" placeholder="EX: CHEF GORDON" 
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block">Access Role</label>
                            <select 
                                value={newStaff.role}
                                onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all appearance-none"
                            >
                                <option value="chef" className="bg-[#121214]">KITCHEN NODE (CHEF)</option>
                                <option value="waiter" className="bg-[#121214]">SERVICE NODE (WAITER)</option>
                                <option value="manager" className="bg-[#121214]">MANAGER NODE (COMMAND)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-white/30 italic mb-2 block">Matrix PIN (4 Digit)</label>
                            <input 
                                value={newStaff.pin}
                                onChange={(e) => setNewStaff({...newStaff, pin: e.target.value})}
                                type="password" maxLength="4" placeholder="----" 
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all text-center tracking-[1em]" 
                            />
                        </div>
                        <button onClick={addStaff} className="w-full py-5 bg-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-indigo-600/20 hover:scale-[1.05] transition-all">Activate Staff Node</button>
                    </div>
                </div>

                {/* STAFF REGISTRY */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                                <th className="p-8">Staff Identity</th>
                                <th className="p-8">Matrix Role</th>
                                <th className="p-8 text-center">Security PIN</th>
                                <th className="p-8 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-white/60">
                            {staff.map((s, i) => (
                                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 font-black italic group-hover:scale-110 transition-transform">{s.name.charAt(0)}</div>
                                            <div>
                                                <p className="font-black italic text-white uppercase">{s.name}</p>
                                                <p className="text-[8px] opacity-40 uppercase tracking-widest font-black">Status: <span className="text-emerald-400">{s.status}</span></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            {s.role === 'chef' ? <ShieldAlert className="w-3 h-3 text-rose-500" /> : <Shield className="w-3 h-3 text-indigo-400" />}
                                            <span className="text-[10px] font-black uppercase italic tracking-widest text-white/80">{s.role} Node</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-center">
                                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
                                            <Key className="w-3 h-3 opacity-30" />
                                            <span className="text-[10px] font-black tracking-[0.2em]">{s.pin}</span>
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <button onClick={() => deleteStaff(s.id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ROLE EXPLAINER NODES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { role: 'CHEF', access: 'KITCHEN HUB ONLY', desc: 'Can process KOTs and change item status.', color: 'rose' },
                    { role: 'WAITER', access: 'POS & TABLES ONLY', desc: 'Can place orders and manage seat mapping.', color: 'indigo' },
                    { role: 'MANAGER', access: 'FULL OPS CONTROL', desc: 'Can edit menu, manage staff, and view dashboard.', color: 'emerald' }
                ].map((node, i) => (
                    <div key={i} className={`p-8 bg-gradient-to-br from-${node.color}-600/10 to-${node.color}-900/10 border border-${node.color}-500/20 rounded-[40px] group hover:border-${node.color}-500/40 transition-all`}>
                        <Zap className={`w-6 h-6 text-${node.color}-400 mb-6 group-hover:scale-125 transition-transform`} />
                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">{node.role} Matrix</h4>
                        <p className={`text-[9px] font-black uppercase text-${node.color}-400 mb-4 italic tracking-widest`}>{node.access}</p>
                        <p className="text-[10px] font-black italic text-white/40 leading-relaxed">{node.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffManager;
