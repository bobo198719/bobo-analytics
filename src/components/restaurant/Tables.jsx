import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Receipt,
  RotateCcw,
  CheckCircle,
  LayoutGrid,
  Users2,
  QrCode,
  Table as TableIcon,
  X,
  Download,
  ExternalLink
} from 'lucide-react';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState(null); // { table }

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/v2/restaurant/tables');
      const data = await res.json();
      setTables(data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 3000); // Polling every 3s

    const ws = new WebSocket('wss://srv1449576.hstgr.cloud:8080');
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'NEW_ORDER' || msg.type === 'STATUS_CHANGE') {
            fetchTables();
        }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  const addTable = async () => {
    const num = prompt("Enter Table Number:");
    if (!num) return;
    try {
        await fetch('/api/v2/restaurant/tables', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table_number: num })
        });
        fetchTables();
    } catch (err) { console.error(err); }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available': return { color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20', label: 'Available' };
      case 'occupied': return { color: 'from-rose-400 to-rose-600', shadow: 'shadow-rose-500/20', label: 'Occupied' };
      case 'ordered': return { color: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/20', label: 'Ordered' };
      default: return { color: 'from-white/10 to-white/20', shadow: '', label: 'Unknown' };
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 font-['Plus_Jakarta_Sans']">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Floor <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">Intelligence</span></h1>
          <p className="text-white/30 mt-3 uppercase text-[10px] font-black tracking-[0.4em] italic leading-none">Autonomous Seating Matrix | ID: FC-221</p>
        </div>
        <div className="flex bg-black/20 p-2 rounded-2xl border border-white/5 w-fit relative z-10">
           <div className="flex items-center gap-8 px-6 py-2">
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Available</span></div>
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Occupied</span></div>
              <div className="flex items-center gap-2.5"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div> <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Ordered</span></div>
           </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
        {tables.map((table) => {
          const config = getStatusConfig(table.status);
          const qrUrl = `${window.location.origin}/order/table/${table.table_number}`;
          const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&bgcolor=0b0f1a&color=ffffff&margin=16`;
          return (
            <div key={table.id} className="group relative bg-white/5 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl transition-all hover:border-orange-500/30 hover:bg-white/[0.07]">
              {/* Main clickable area */}
              <div
                onClick={() => {
                  localStorage.setItem('selected_table_id', table.id);
                  localStorage.setItem('selected_table_number', table.table_number);
                  window.dispatchEvent(new CustomEvent('switch-ros-section', { detail: { section: 'pos' } }));
                }}
                className="flex flex-col items-center justify-center p-10 cursor-pointer active:scale-95 transition-transform"
              >
                <div className={`absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity ${config.color}`}></div>
                <div className={`w-36 h-36 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500 shadow-inner`}>
                   <div className={`w-28 h-28 rounded-full bg-gradient-to-br flex flex-col items-center justify-center shadow-2xl border border-white/20 ${config.color}`}>
                      <p className="text-3xl font-black italic tracking-tighter text-white drop-shadow-lg">{table.table_number}</p>
                   </div>
                </div>
                <p className={`mt-6 text-[10px] font-black uppercase tracking-[0.3em] italic ${table.status === 'available' ? 'text-emerald-400' : (table.status === 'occupied' ? 'text-rose-400' : 'text-orange-400')}`}>
                  {config.label}
                </p>
              </div>

              {/* QR Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={(e) => { e.stopPropagation(); setQrModal({ table, qrImgSrc, qrUrl }); }}
                  className="w-full py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center gap-2 text-orange-400 text-[11px] font-black uppercase italic hover:bg-orange-500/20 transition-all"
                >
                  <QrCode className="w-3.5 h-3.5" /> Generate QR
                </button>
              </div>
            </div>
          );
        })}
        
        <div 
          onClick={addTable}
          className="min-h-[300px] border-4 border-dashed border-white/5 rounded-[48px] flex flex-col items-center justify-center gap-6 text-white/10 hover:text-orange-400/50 hover:border-orange-500/20 transition-all cursor-pointer group hover:bg-orange-500/5"
        >
           <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all border border-white/5 group-hover:border-orange-500/20"><TableIcon className="w-8 h-8"/></div>
           <p className="font-black italic uppercase text-[10px] tracking-[0.3em] leading-none text-center">Provision <br />New Node</p>
        </div>
      </section>

      {/* QR MODAL */}
      {qrModal && (
        <div className="fixed inset-0 bg-[#05081a]/95 backdrop-blur-3xl z-[99999] flex items-center justify-center p-6" onClick={() => setQrModal(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-[#0b0f24] border border-orange-500/20 rounded-[48px] p-10 max-w-sm w-full text-center shadow-[0_0_80px_rgba(249,115,22,0.15)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-t-[48px]"></div>
            <button onClick={() => setQrModal(null)} className="absolute top-5 right-5 w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><X className="w-4 h-4" /></button>
            
            <h3 className="text-xl font-black italic uppercase tracking-tight mb-1">Table <span className="text-orange-400">{qrModal.table.table_number}</span></h3>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-6">Scan to Order from Phone</p>
            
            {/* QR Code */}
            <div className="bg-white rounded-3xl p-4 flex items-center justify-center mx-auto mb-6" style={{width:'220px',height:'220px'}}>
              <img src={qrModal.qrImgSrc} alt="QR Code" className="w-full h-full" />
            </div>

            <p className="text-[9px] text-white/20 font-mono mb-6 bg-white/5 rounded-xl px-3 py-2 break-all">{qrModal.qrUrl}</p>

            <div className="flex gap-3">
              <a
                href={qrModal.qrImgSrc + '&download=1'}
                download={`table-${qrModal.table.table_number}-qr.png`}
                className="flex-1 py-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center gap-2 text-orange-400 text-[11px] font-black uppercase hover:bg-orange-500/20 transition-all"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <a
                href={qrModal.qrUrl}
                target="_blank"
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white/40 text-[11px] font-black uppercase hover:text-white hover:bg-white/10 transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Preview
              </a>
            </div>

            <p className="text-[9px] text-white/15 mt-5 italic">Customers scan this QR → browse menu → place order → kitchen is notified instantly</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
