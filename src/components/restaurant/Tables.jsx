import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  Receipt,
  RotateCcw,
  CheckCircle,
  LayoutGrid
} from 'lucide-react';

const Tables = () => {
  const [tables, setTables] = useState([
    { id: 1, number: '01', status: 'available', capacity: 2 },
    { id: 2, number: '02', status: 'occupied', capacity: 4, orders: 1 },
    { id: 3, number: '03', status: 'ordered', capacity: 4, orders: 3 },
    { id: 4, number: '04', status: 'available', capacity: 6 },
    { id: 5, number: '05', status: 'ordered', capacity: 2, orders: 2 },
    { id: 6, number: '06', status: 'available', capacity: 4 },
    { id: 7, number: '07', status: 'occupied', capacity: 8, orders: 1 },
    { id: 8, number: '08', status: 'available', capacity: 4 }
  ]);

  const toggleStatus = (id) => {
    setTables(tables.map(t => {
       if(t.id === id) {
          const next = t.status === 'available' ? 'occupied' : (t.status === 'occupied' ? 'ordered' : 'available');
          return { ...t, status: next };
       }
       return t;
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'from-emerald-400 to-emerald-600 shadow-emerald-500/20';
      case 'occupied': return 'from-rose-400 to-rose-600 shadow-rose-500/20';
      case 'ordered': return 'from-amber-400 to-amber-600 shadow-amber-500/20';
      default: return 'from-white/10 to-white/20';
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight italic">Floor Intelligence</h1>
          <p className="text-white/50 mt-1 uppercase text-xs font-bold tracking-widest">Bobo Restaurant OS | Ground Control</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
           <div className="flex items-center gap-6 px-4">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> <span className="text-[10px] font-black uppercase text-white/50">Available</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> <span className="text-[10px] font-black uppercase text-white/50">Occupied</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> <span className="text-[10px] font-black uppercase text-white/50">Ordered</span></div>
           </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {tables.map((table, i) => (
          <div 
            key={table.id}
            onClick={() => toggleStatus(table.id)}
            className="group relative h-64 bg-white/5 border border-white/10 rounded-[48px] cursor-pointer hover:border-white/20 transition-all flex flex-col items-center justify-center p-8 overflow-hidden"
          >
            {/* Status Indicator Ring */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity ${getStatusColor(table.status)}`}></div>
            
            <div className={`w-36 h-36 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center relative transition-transform group-hover:scale-110 duration-500`}>
               <div className={`w-28 h-28 rounded-full bg-gradient-to-br flex flex-col items-center justify-center shadow-2xl ${getStatusColor(table.status)}`}>
                  <p className="text-4xl font-black italic">{table.number}</p>
               </div>
               {/* Capacity Badge */}
               <div className="absolute -bottom-2 right-4 bg-[#05081a] border border-white/10 p-2 px-3 rounded-full flex items-center gap-2 text-[10px] font-black shadow-xl">
                  <Users className="w-3 h-3 text-white/50" />
                  <span>x{table.capacity}</span>
               </div>
            </div>

            <p className={`mt-6 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${table.status === 'available' ? 'text-emerald-400' : (table.status === 'occupied' ? 'text-rose-400' : 'text-amber-400')}`}>
               {table.status}
            </p>

            {/* Hover Quick Actions */}
            <div className="absolute inset-0 bg-[#05081a]/95 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 py-8 pointer-events-none group-hover:pointer-events-auto">
               <h4 className="text-sm font-black italic uppercase tracking-widest mb-2">Table Control</h4>
               <div className="grid grid-cols-2 gap-3 w-full max-w-[140px]">
                  <button className="h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Receipt className="w-5 h-5" /></button>
                  <button className="h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Users2 className="w-5 h-5" /></button>
                  <button className="h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                  <button className="h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle className="w-5 h-5" /></button>
               </div>
            </div>
          </div>
        ))}
        
        {/* Add New Table Button */}
        <div className="h-64 border-4 border-dashed border-white/5 rounded-[48px] flex flex-col items-center justify-center gap-4 text-white/20 hover:text-white/40 hover:border-white/10 transition-all cursor-pointer group">
           <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform"><LayoutGrid /></div>
           <p className="font-black italic uppercase text-xs tracking-widest">Provision New Table</p>
        </div>
      </section>
    </div>
  );
};

export default Tables;
