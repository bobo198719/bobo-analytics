import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, Zap, UserPlus, Trash2, Key, Clock, LogIn, LogOut, Coffee, Eye, EyeOff, Crown } from 'lucide-react';

const StaffManager = () => {
    const [staff, setStaff] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPass, setShowPass] = useState({});
    
    const MODULE_NODES = [
        { id: 'dashboard', label: 'DASHBOARD HUB' },
        { id: 'pos', label: 'POS TERMINAL' },
        { id: 'tables', label: 'TABLES MATRIX' },
        { id: 'kitchen', label: 'KITCHEN HUB' },
        { id: 'waiter', label: 'WAITER QUEUE' },
        { id: 'menu', label: 'MENU HUB' },
        { id: 'upload', label: 'AI SMART UPLOAD' },
        { id: 'customers', label: 'CUSTOMER CRM' },
        { id: 'analytics', label: 'ANALYTICS HUB' },
        { id: 'staff', label: 'STAFF GOVERNANCE' },
        { id: 'billing', label: 'BILLING & PLAN' }
    ];

    const [newStaff, setNewStaff] = useState({ 
        username: '', 
        password: '', 
        role: 'waiter', 
        permission: 'limited',
        modules: []
    });

    const toggleModule = (id) => {
        setNewStaff(prev => {
            const modules = prev.modules.includes(id) 
                ? prev.modules.filter(m => m !== id) 
                : [...prev.modules, id];
            return { ...prev, modules };
        });
    };

    const fetchData = async () => {
        try {
            const [staffRes, logsRes] = await Promise.all([
                fetch('/api/v2/restaurant/staff'),
                fetch('/api/v2/restaurant/staff/logs')
            ]);
            const staffData = await staffRes.json();
            const logsData = await logsRes.json();
            setStaff(Array.isArray(staffData) ? staffData : []);
            setLogs(Array.isArray(logsData) ? logsData : []);
            setLoading(false);
        } catch (err) {
            console.error("Staff Data Linkage Fail:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const int = setInterval(fetchData, 10000);
        return () => clearInterval(int);
    }, []);

    const addStaff = async () => {
        if (!newStaff.username || !newStaff.password) return alert("IDENTITY & TOKEN REQUIRED");
        try {
            const res = await fetch('/api/v2/restaurant/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStaff)
            });
            if (res.ok) {
                setNewStaff({ username: '', password: '', role: 'waiter', permission: 'limited', modules: [] });
                fetchData();
            }
        } catch (err) { console.error(err); }
    };

    const togglePass = (id) => {
        setShowPass(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-32 font-['Plus_Jakarta_Sans']">
            
            <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-2xl">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Human <span className="bg-gradient-to-r from-indigo-500 to-indigo-300 bg-clip-text text-transparent">Resources</span></h1>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic leading-none">Global Workforce Protocol | Active Terminal: ID-001</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 group-hover:bg-indigo-500/10 transition-all"></div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                
                {/* PROVISIONING CONSOLE */}
                <aside className="lg:col-span-1 space-y-8">
                    <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                        <h3 className="text-xl font-black italic uppercase text-indigo-400 mb-10 flex items-center gap-4">
                           <UserPlus className="w-6 h-6" /> Provisioning
                        </h3>
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/20 italic mb-3 block tracking-widest">Master Identity (ID)</label>
                                <input 
                                    value={newStaff.username}
                                    onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                                    type="text" placeholder="EX: chef_marco" 
                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all text-sm uppercase placeholder:text-white/5" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/20 italic mb-3 block tracking-widest">Security Token (Pass)</label>
                                <input 
                                    value={newStaff.password}
                                    onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                                    type="text" placeholder="••••••••" 
                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all text-sm placeholder:text-white/5" 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/20 italic mb-3 block tracking-widest">Access Node (Role)</label>
                                <select 
                                    value={newStaff.role}
                                    onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-indigo-500 transition-all appearance-none text-xs"
                                >
                                    <option value="owner" className="bg-[#0b0f1a] text-orange-400">OWNER TERMINAL</option>
                                    <option value="manager" className="bg-[#0b0f1a]">MANAGER TERMINAL</option>
                                    <option value="chef" className="bg-[#0b0f1a]">CHEF TERMINAL</option>
                                    <option value="waiter" className="bg-[#0b0f1a]">WAITER TERMINAL</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/20 italic mb-3 block tracking-widest">Operational Scope</label>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <button 
                                        onClick={() => setNewStaff({...newStaff, permission: 'limited'})}
                                        className={`py-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${newStaff.permission === 'limited' ? 'bg-indigo-600 shadow-xl' : 'bg-white/5 border border-white/10 opacity-30 italic'}`}
                                    >Limited Access</button>
                                    <button 
                                        onClick={() => setNewStaff({...newStaff, permission: 'entire'})}
                                        className={`py-4 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${newStaff.permission === 'entire' ? 'bg-orange-600 shadow-xl' : 'bg-white/5 border border-white/10 opacity-30 italic'}`}
                                    >Entire Access</button>
                                </div>

                                {newStaff.permission === 'limited' && (
                                    <div className="bg-black/20 p-6 rounded-[32px] border border-white/5 space-y-4 animate-in slide-in-from-top-1 px-4">
                                        <p className="text-[9px] font-black uppercase text-indigo-400 italic mb-4">Select Allowed Terminals:</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {MODULE_NODES.map(node => (
                                                <div 
                                                    key={node.id} 
                                                    onClick={() => toggleModule(node.id)}
                                                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer border transition-all ${newStaff.modules.includes(node.id) ? 'bg-indigo-500/20 border-indigo-500/40 text-white' : 'bg-white/5 border-white/5 text-white/20'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full border ${newStaff.modules.includes(node.id) ? 'bg-indigo-400 border-indigo-400' : 'border-white/20'}`}></div>
                                                    <span className="text-[8px] font-black uppercase italic tracking-widest leading-none">{node.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={addStaff} className="w-full py-6 bg-indigo-600 rounded-3xl text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-indigo-600/30 hover:scale-[1.05] active:scale-95 transition-all text-white mt-4 border border-indigo-400/20">Commit Identity Node</button>
                        </div>
                   </div>
                </aside>

                {/* REGISTRY & AUDIT CONSOLE */}
                <div className="lg:col-span-3 space-y-12">
                   
                   {/* REGISTRY */}
                   <div className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl relative">
                      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                         <h3 className="text-sm font-black italic uppercase tracking-tighter text-indigo-400">Identity Master Registry</h3>
                         <span className="text-[8px] font-black uppercase text-white/20 tracking-[0.4em] italic leading-none">{staff.length} Elements Linked</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/30 italic">
                                    <th className="p-8">Staff Identity</th>
                                    <th className="p-8">Node Role</th>
                                    <th className="p-8">Security Token</th>
                                    <th className="p-8">Scope / Permissions</th>
                                    <th className="p-8 text-right">Node Death</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map((s) => (
                                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-all group">
                                        <td className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black italic shadow-xl shadow-indigo-500/10 group-hover:scale-110 transition-transform`}>{s.username.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <p className="font-black italic text-white uppercase text-sm leading-tight">{s.username}</p>
                                                    <p className="text-[7px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-1.5 italic">Status: Fully Synchronized</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${s.role === 'owner' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : s.role === 'chef' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : s.role === 'waiter' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                                                {s.role === 'owner' && <Crown className="w-2 h-2" />}
                                                {s.role} Node
                                            </span>
                                        </td>
                                        <td className="p-8">
                                           <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 w-fit min-w-[160px]">
                                              <span className="text-[10px] font-black tracking-widest text-white/80">{showPass[s.id] ? s.password : '••••••••'}</span>
                                              <button onClick={() => togglePass(s.id)} className="ml-auto text-white/20 hover:text-indigo-400 transition-colors">
                                                 {showPass[s.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                              </button>
                                           </div>
                                        </td>
                                        <td className="p-8">
                                           <div className="flex flex-col gap-2">
                                               <span className={`text-[8px] font-black uppercase italic ${s.permission === 'entire' ? 'text-orange-400' : 'text-white/20'}`}>{s.permission} Access</span>
                                               {s.permission === 'limited' && (
                                                   <p className="text-[7px] font-black grayscale opacity-40 uppercase tracking-tighter">Terminals: {s.modules?.length || 0} Enabled</p>
                                               )}
                                           </div>
                                        </td>
                                        <td className="p-8 text-right">
                                            <button className="p-4 bg-rose-600/10 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-xl active:scale-90"><Trash2 className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                      </div>
                   </div>

                   {/* AUDIT LOGS */}
                   <div className="bg-[#0b0f1a] border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px]"></div>
                      <h3 className="text-xl font-black italic uppercase text-indigo-400 mb-10 flex items-center gap-4">
                         <Clock className="w-6 h-6" /> Surveillance Audit
                      </h3>
                      <div className="space-y-4">
                         {logs.length === 0 ? (
                           <div className="py-20 text-center opacity-20 italic font-black uppercase text-[10px] tracking-widest">No activity detected on local node</div>
                         ) : logs.map((log, i) => (
                           <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all group">
                              <div className="flex items-center gap-6">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${log.event_type === 'login' ? 'bg-emerald-500/20 text-emerald-500' : log.event_type === 'logout' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                    {log.event_type === 'login' ? <LogIn className="w-5 h-5" /> : log.event_type === 'logout' ? <LogOut className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-white italic group-hover:text-indigo-400 transition-colors">{log.username} :: <span className="uppercase text-white/40">{log.event_type.replace('_', ' ')}</span></p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 italic">{new Date(log.timestamp).toLocaleString()}</p>
                                 </div>
                              </div>
                              <div className="text-[7px] font-black text-white/10 border border-white/5 px-3 py-1.5 rounded-lg italic">VERIFIED</div>
                           </div>
                        ))}
                      </div>
                   </div>

                </div>
            </div>
        </div>
    );
};

export default StaffManager;
