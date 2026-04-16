import React, { useState } from 'react';
import { Calendar, Search, Printer, FileText, Download, Filter } from 'lucide-react';

const DailyReport = () => {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUser, setSelectedUser] = useState('All Users');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Plus_Jakarta_Sans']">
      {/* HEADER SECTION */}
      <div className="bg-[#0f172a] border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">User</label>
               <select 
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all appearance-none"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
               >
                  <option value="All Users">Select User</option>
                  <option value="Admin">Admin</option>
                  <option value="Cashier 1">Cashier 1</option>
               </select>
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">From Date</label>
               <div className="relative">
                 <input 
                    type="date" 
                    value={dateFrom} 
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all"
                 />
                 <Calendar className="absolute right-3 top-3 w-4 h-4 text-white/20 pointer-events-none hidden md:block" />
               </div>
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">To Date</label>
               <div className="relative">
                 <input 
                    type="date" 
                    value={dateTo} 
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all"
                 />
                 <Calendar className="absolute right-3 top-3 w-4 h-4 text-white/20 pointer-events-none hidden md:block" />
               </div>
            </div>
            <div className="flex flex-col gap-1 justify-end">
               <button className="h-[46px] w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] italic transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95">
                 <Search className="w-4 h-4" /> Search
               </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic whitespace-nowrap">Print Layout</label>
              <select className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none">
                 <option>Default Report</option>
                 <option>Tax Report</option>
              </select>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all">
                <FileText className="w-4 h-4 text-white/50" /> Thermal Print
              </button>
              <button className="flex-1 md:flex-none px-6 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all">
                <Printer className="w-4 h-4 text-white/50" /> Day Report Print
              </button>
           </div>
        </div>
      </div>

      {/* TODAYS SUMMARY TABLE */}
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <h3 className="px-6 py-4 bg-white/5 text-center text-[12px] font-black uppercase tracking-[0.3em] text-orange-500 italic border-b border-white/10">TODAYS SUMMARY</h3>
        <div className="flex flex-col md:flex-row">
           <div className="flex-1 grid grid-cols-2 text-sm font-bold border-b md:border-b-0 md:border-r border-white/10">
              <div className="px-6 py-4 border-b border-white/5 text-white/60">Amount</div>
              <div className="px-6 py-4 border-b border-white/5 text-right font-black">673.000</div>
              
              <div className="px-6 py-4 border-b border-white/5 text-white/60">Tax</div>
              <div className="px-6 py-4 border-b border-white/5 text-right">33.650</div>
              
              <div className="px-6 py-4 border-b border-white/5 text-white/60">Extra Charges</div>
              <div className="px-6 py-4 border-b border-white/5 text-right">15.000</div>
              
              <div className="px-6 py-4 border-b border-white/5 text-white/60">Round Off</div>
              <div className="px-6 py-4 border-b border-white/5 text-right text-emerald-400">0.100</div>

              <div className="px-6 py-4 font-black">Total Sale</div>
              <div className="px-6 py-4 text-right font-black text-indigo-400">721.750</div>
           </div>
           <div className="flex-1 flex flex-row items-center justify-center p-6 gap-8 bg-white/5">
              <div className="text-white/60 font-black uppercase tracking-widest text-sm">TOTAL SALE</div>
              <div className="text-4xl font-black text-white">721.750</div>
           </div>
        </div>
      </div>

      {/* OVERALL TRANSACTIONS TABLE */}
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-xl mt-8">
        <h3 className="px-6 py-4 bg-white/5 text-center text-[12px] font-black uppercase tracking-[0.3em] text-orange-500 italic border-b border-white/10">OVERALL TRANSACTIONS</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-bold">
            <thead className="bg-black/20 border-b border-white/10 text-[10px] uppercase tracking-widest text-white/40">
              <tr>
                <th className="px-6 py-4"></th>
                <th className="px-6 py-4 text-right">Cash</th>
                <th className="px-6 py-4 text-right">Master Card</th>
                <th className="px-6 py-4 text-right transform">Mentorpos</th>
                <th className="px-6 py-4 text-right text-white/80">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5 text-white/60">Sale</td>
                <td className="px-6 py-5 text-right">298.750</td>
                <td className="px-6 py-5 text-right">200.000</td>
                <td className="px-6 py-5 text-right">223.000</td>
                <td className="px-6 py-5 text-right font-black">721.750</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5 text-emerald-400/80">In Transactions</td>
                <td className="px-6 py-5 text-right">3804.850</td>
                <td className="px-6 py-5 text-right">0.000</td>
                <td className="px-6 py-5 text-right">0.000</td>
                <td className="px-6 py-5 text-right font-black text-emerald-400">3804.850</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5 text-rose-400/80">Out Transactions</td>
                <td className="px-6 py-5 text-right">3150.000</td>
                <td className="px-6 py-5 text-right">0.000</td>
                <td className="px-6 py-5 text-right">0.000</td>
                <td className="px-6 py-5 text-right font-black text-rose-400">3150.000</td>
              </tr>
              <tr className="bg-white/5">
                <td className="px-6 py-5 font-black uppercase tracking-widest text-[11px]">Total</td>
                <td className="px-6 py-5 text-right font-black text-white/80">953.600</td>
                <td className="px-6 py-5 text-right font-black text-white/80">200.000</td>
                <td className="px-6 py-5 text-right font-black text-white/80">223.000</td>
                <td className="px-6 py-5 text-right font-black text-xl text-indigo-400">1376.600</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DailyReport;
