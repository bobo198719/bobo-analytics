import React, { useState } from 'react';
import { Calendar, Search, Printer, FileText, Download, Filter } from 'lucide-react';

const DailyReport = () => {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [activeTab, setActiveTab] = useState('All');

  // MOCK DATA for Order Ledger
  const ordersData = [
    { id: 1, orderNo: '72\n[303590]', receiptNo: '66\n[113897]', channel: '-', orderFor: 'Dine In', table: 'Lounge / 2', dateTime: '2025-01-10\n16:04:35', guest: 'pawan', staff: '-', amount: 165.900, due: 0.000, status: 'Completed', orderBy: 'admin', paidAmt: 'Cash: 65.900\nMaster Card: 100.000' },
    { id: 2, orderNo: '[303589]', receiptNo: '[113896]', channel: 'mentorpos # 10000331', orderFor: 'Online Order', table: '-', dateTime: '2025-01-10\n15:03:16', guest: 'Vinayaka', staff: '-', amount: 223, due: 0, status: 'Completed', orderBy: 'admin', paidAmt: 'Mentorpos:\n223' },
    { id: 3, orderNo: '71\n[303588]', receiptNo: '65\n[113895]', channel: '-', orderFor: 'Dine In', table: 'Lounge / 3', dateTime: '2025-01-10\n14:52:02', guest: 'Vinayaka', staff: '-', amount: 332.850, due: 0.000, status: 'Completed', orderBy: 'admin', paidAmt: 'Cash: 232.850\nMaster Card: 100.000' }
  ];

  const exportToExcel = async (printType) => {
    if (!window.ExcelJS) {
      alert("Excel export library is currently loading. Please try again in a few seconds.");
      return;
    }

    const wb = new window.ExcelJS.Workbook();
    const ws = wb.addWorksheet("Daily Report", {
       views: [{ showGridLines: false }] // Hide default faint gridlines, we'll draw solid borders
    });

    // --- STYLES ---
    const borderAll = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    const titleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Dark Slate
    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } }; // Orange
    const subHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; // Light Gray
    
    // Column Widths
    ws.columns = [
      { width: 25 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }
    ];

    // --- TOP META INFO ---
    ws.mergeCells('A1:E1');
    ws.getCell('A1').value = `Bobo OS - Daily Report (${printType})`;
    ws.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A1').fill = titleFill;
    ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

    ws.mergeCells('A2:E2');
    ws.getCell('A2').value = `Date: ${dateFrom} to ${dateTo} | User: ${selectedUser}`;
    ws.getCell('A2').font = { italic: true, size: 11, color: { argb: 'FF475569' } };
    ws.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    
    ws.addRow([]); // Blank spacer

    // --- TODAYS SUMMARY TABLE ---
    ws.mergeCells('A4:B4');
    ws.getCell('A4').value = "TODAYS SUMMARY";
    ws.getCell('A4').font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getCell('A4').fill = headerFill;
    ws.getCell('A4').alignment = { horizontal: 'center' };
    ws.getCell('A4').border = borderAll;
    ws.getCell('B4').border = borderAll;

    const summaryData = [
      ['Amount', 673.000],
      ['Tax', 33.650],
      ['Extra Charges', 15.000],
      ['Round Off', 0.100],
      ['Total Sale', 721.750]
    ];

    summaryData.forEach((row, idx) => {
      const dbRow = ws.addRow([row[0], row[1]]);
      const isTotal = (idx === summaryData.length - 1);
      
      const c1 = dbRow.getCell(1);
      const c2 = dbRow.getCell(2);
      
      c1.border = borderAll;
      c2.border = borderAll;
      
      if (isTotal) {
         c1.font = { bold: true };
         c2.font = { bold: true, color: { argb: 'FF6366F1' } };
         c1.fill = subHeaderFill;
         c2.fill = subHeaderFill;
      }
      
      c2.numFmt = '#,##0.00';
    });

    ws.addRow([]); // Blank spacer

    // --- OVERALL TRANSACTIONS TABLE ---
    const transStart = ws.rowCount + 1;
    ws.mergeCells(`A${transStart}:E${transStart}`);
    ws.getCell(`A${transStart}`).value = "OVERALL TRANSACTIONS";
    ws.getCell(`A${transStart}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getCell(`A${transStart}`).fill = headerFill;
    ws.getCell(`A${transStart}`).alignment = { horizontal: 'center' };
    for (let c = 1; c <= 5; c++) ws.getCell(transStart, c).border = borderAll;

    const tableHeaders = ['Transaction Type', 'Cash', 'Master Card', 'Mentorpos', 'Total'];
    const thRow = ws.addRow(tableHeaders);
    thRow.eachCell(c => {
       c.font = { bold: true };
       c.fill = subHeaderFill;
       c.border = borderAll;
       c.alignment = { horizontal: 'center' };
    });

    const transData = [
      ['Sale', 298.750, 200.000, 223.000, 721.750],
      ['In Transactions', 3804.850, 0.000, 0.000, 3804.850],
      ['Out Transactions', 3150.000, 0.000, 0.000, 3150.000],
      ['Total', 953.600, 200.000, 223.000, 1376.600],
    ];

    transData.forEach((row, idx) => {
      const dbRow = ws.addRow(row);
      const isTotal = (idx === transData.length - 1);
      
      dbRow.eachCell((c, colNum) => {
         c.border = borderAll;
         if (colNum > 1) c.numFmt = '#,##0.00'; // currency format
         
         if (isTotal) {
            c.font = { bold: true };
            c.fill = subHeaderFill;
            if (colNum === 5) c.font = { bold: true, color: { argb: 'FF6366F1' } };
         }
      });
    });

    // Write buffer and download natively without FileSaver
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Daily_Report_${printType.replace(/\s+/g, '_')}_${dateFrom}.xlsx`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
  };

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
              <button onClick={() => exportToExcel('Thermal')} className="flex-1 md:flex-none px-6 py-2 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all">
                <FileText className="w-4 h-4 text-white/50" /> Thermal Print
              </button>
              <button onClick={() => exportToExcel('Day Report')} className="flex-1 md:flex-none px-6 py-2 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all">
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

      {/* ORDER LEDGER (DETAILED HISTORY) */}
      <div className="bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-xl mt-8">
        
        {/* TABS */}
        <div className="flex border-b border-white/10 bg-black/20">
          {['All (3)', 'Dine In (2)', 'Online Order (1)'].map(tab => {
            const rawName = tab.split(' ')[0] === 'All' ? 'All' : tab.includes('Dine') ? 'Dine In' : 'Online Order';
            const isActive = activeTab === rawName;
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(rawName)}
                className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${isActive ? 'text-indigo-400' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
              >
                {tab}
                {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
              </button>
            )
          })}
        </div>

        {/* FILTERS */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex flex-wrap gap-4 items-center">
           <div className="relative flex-1 min-w-[200px]">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
             <input type="text" placeholder="Search..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-white/20" />
           </div>
           <select className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 appearance-none min-w-[150px]">
             <option>All Status</option>
             <option>Completed</option>
             <option>Pending</option>
           </select>
           <select className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 appearance-none min-w-[150px]">
             <option>Staff</option>
           </select>
           <select className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 appearance-none min-w-[150px]">
             <option>Pay Type</option>
             <option>Cash</option>
             <option>Master Card</option>
           </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-bold whitespace-nowrap">
            <thead className="bg-[#1e293b]/60 border-b border-white/10 text-[10px] uppercase tracking-widest text-indigo-300">
              <tr>
                <th className="px-4 py-4">Sr.<br/>No</th>
                <th className="px-4 py-4">Order No ↕</th>
                <th className="px-4 py-4">Receipt No ↕</th>
                <th className="px-4 py-4">Channel ↕</th>
                <th className="px-4 py-4">Order For ↕</th>
                <th className="px-4 py-4">Dining Area<br/>/ Table ↕</th>
                <th className="px-4 py-4">Date Time ↕</th>
                <th className="px-4 py-4">Guest Name ↕</th>
                <th className="px-4 py-4">Staff ↕</th>
                <th className="px-4 py-4 text-right">Amount ↕</th>
                <th className="px-4 py-4 text-right">Due ↕</th>
                <th className="px-4 py-4 text-center">Status ↕</th>
                <th className="px-4 py-4">Order By ↕</th>
                <th className="px-4 py-4">Paid Amt.</th>
                <th className="px-4 py-4 text-center">Void</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] leading-relaxed">
              {ordersData.filter(o => activeTab === 'All' ? true : o.orderFor === activeTab).map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3 text-white/40">{order.id}</td>
                  <td className="px-4 py-3 font-mono whitespace-pre-wrap">{order.orderNo}</td>
                  <td className="px-4 py-3 font-mono whitespace-pre-wrap">{order.receiptNo}</td>
                  <td className="px-4 py-3 text-white/70 whitespace-pre-wrap">{order.channel}</td>
                  <td className="px-4 py-3 font-black text-white/90">{order.orderFor}</td>
                  <td className="px-4 py-3 text-white/80">{order.table}</td>
                  <td className="px-4 py-3 text-white/60 font-mono whitespace-pre-wrap">{order.dateTime}</td>
                  <td className="px-4 py-3 text-white/90">{order.guest}</td>
                  <td className="px-4 py-3 text-white/40">{order.staff}</td>
                  <td className="px-4 py-3 text-right font-black text-white">{order.amount}</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{order.due}</td>
                  <td className="px-4 py-3 text-center">
                     <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider">{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-white/70">{order.orderBy}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-white/60 whitespace-pre-wrap leading-tight">{order.paidAmt}</td>
                  <td className="px-4 py-3 text-center">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DailyReport;
