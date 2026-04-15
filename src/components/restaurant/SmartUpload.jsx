import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Loader2, AlertTriangle, Trash2, ChevronRight } from 'lucide-react';

const SmartUpload = () => {
  const [step, setStep] = useState('idle'); // idle | parsing | preview | uploading | done | error
  const [parsedRows, setParsedRows] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState({ success: 0, failed: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const CATEGORIES = ['Starters', 'Main Course', 'Beverages', 'Desserts'];

  const parseFile = (file) => {
    setStep('parsing');
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = window.XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!json.length) {
          setErrorMsg('The file appears to be empty. Please check the spreadsheet.');
          setStep('error');
          return;
        }

        // Normalize column headers (case-insensitive)
        const rows = json.map((row, idx) => {
          const norm = {};
          Object.keys(row).forEach(k => { norm[k.toLowerCase().trim()] = row[k]; });
          return {
            _id: idx,
            name: String(norm['name'] || norm['item'] || norm['dish'] || norm['product'] || '').trim(),
            price: parseFloat(norm['price'] || norm['rate'] || norm['cost'] || 0) || 0,
            category: CATEGORIES.find(c => c.toLowerCase() === String(norm['category'] || norm['type'] || '').toLowerCase().trim()) || 'Main Course',
            type: String(norm['type'] || norm['veg/non-veg'] || norm['diet'] || 'veg').toLowerCase().includes('non') ? 'non-veg' : 'veg',
            image_url: String(norm['image'] || norm['image_url'] || norm['photo'] || '').trim(),
            _valid: true,
          };
        }).filter(r => r.name && r.price > 0);

        if (!rows.length) {
          setErrorMsg('No valid rows found. Ensure columns: Name, Price, Category are present.');
          setStep('error');
          return;
        }

        setParsedRows(rows);
        setStep('preview');
      } catch (err) {
        setErrorMsg('Failed to parse file: ' + err.message);
        setStep('error');
      }
    };
    reader.onerror = () => { setErrorMsg('Could not read file.'); setStep('error'); };
    reader.readAsArrayBuffer(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = (file) => {
    const ok = file.name.match(/\.(xlsx|xls|csv)$/i);
    if (!ok) { setErrorMsg('Only .xlsx, .xls, or .csv files are supported.'); setStep('error'); return; }
    parseFile(file);
  };

  const removeRow = (id) => setParsedRows(prev => prev.filter(r => r._id !== id));

  const updateRow = (id, field, value) => {
    setParsedRows(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));
  };

  const handleBulkUpload = async () => {
    setStep('uploading');
    setUploadProgress(0);
    let success = 0, failed = 0;

    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      try {
        const res = await fetch('/api/v2/restaurant/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name,
            price: row.price,
            category: row.category,
            type: row.type,
            image_url: row.image_url || '',
          })
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
      setUploadProgress(Math.round(((i + 1) / parsedRows.length) * 100));
    }
    setUploadResults({ success, failed });
    setStep('done');
  };

  const reset = () => { setStep('idle'); setParsedRows([]); setErrorMsg(''); setUploadProgress(0); };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-['Plus_Jakarta_Sans'] p-2">

      {/* HEADER */}
      <header className="bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Smart <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Upload</span>
          </h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">
            Bulk Import Menu Items · Excel / CSV · Automated Catalog Sync
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
      </header>

      {/* STEP: IDLE — Drop Zone */}
      {step === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-4 border-dashed rounded-[56px] p-20 flex flex-col items-center justify-center gap-8 cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' : 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
        >
          <div className={`w-24 h-24 rounded-[32px] bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center transition-all ${dragOver ? 'scale-110 bg-indigo-600/40' : ''}`}>
            <FileSpreadsheet className="w-12 h-12 text-indigo-400" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3">
              Drop Your Spreadsheet Here
            </h2>
            <p className="text-[11px] font-black uppercase text-white/30 tracking-widest italic">
              Supports .xlsx · .xls · .csv
            </p>
            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest italic mt-2">
              Required columns: <span className="text-indigo-400">Name</span>, <span className="text-indigo-400">Price</span> · Optional: Category, Type, Image URL
            </p>
          </div>
          <div className="flex gap-6">
            <div className="px-8 py-4 bg-indigo-600 rounded-2xl font-black italic uppercase tracking-widest text-[10px] text-white shadow-xl shadow-indigo-600/30 flex items-center gap-3 hover:bg-indigo-500 transition-all">
              <Upload className="w-4 h-4" /> Select File
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
        </div>
      )}

      {/* STEP: PARSING */}
      {step === 'parsing' && (
        <div className="bg-white/5 border border-white/10 rounded-[56px] p-20 flex flex-col items-center gap-8">
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Parsing Spreadsheet Data...</p>
        </div>
      )}

      {/* STEP: ERROR */}
      {step === 'error' && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-[48px] p-16 flex flex-col items-center gap-6">
          <XCircle className="w-16 h-16 text-rose-400" />
          <p className="text-white font-black italic text-xl uppercase tracking-tighter text-center">{errorMsg}</p>
          <button onClick={reset} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-white/10 transition-all">Try Again</button>
        </div>
      )}

      {/* STEP: PREVIEW */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Preview <span className="text-indigo-400">Matrix</span></h2>
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest italic mt-1">{parsedRows.length} items ready · Edit or remove before importing</p>
            </div>
            <div className="flex gap-4">
              <button onClick={reset} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-white/10 transition-all">Cancel</button>
              <button onClick={handleBulkUpload} className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-black uppercase tracking-widest text-[10px] italic text-white shadow-xl flex items-center gap-3 hover:scale-[1.03] transition-all active:scale-95">
                <Upload className="w-4 h-4" /> Import {parsedRows.length} Items <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-white/5 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30">
              <span className="col-span-4">Dish Name</span>
              <span className="col-span-2">Price (₹)</span>
              <span className="col-span-3">Category</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-1"></span>
            </div>
            <div className="max-h-[480px] overflow-y-auto no-scrollbar divide-y divide-white/5">
              {parsedRows.map(row => (
                <div key={row._id} className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-white/5 transition-colors group">
                  <input
                    className="col-span-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all"
                    value={row.name}
                    onChange={e => updateRow(row._id, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all"
                    value={row.price}
                    onChange={e => updateRow(row._id, 'price', parseFloat(e.target.value) || 0)}
                  />
                  <select
                    className="col-span-3 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all"
                    value={row.category}
                    onChange={e => updateRow(row._id, 'category', e.target.value)}
                  >
                    {['Starters','Main Course','Beverages','Desserts'].map(c => <option key={c} value={c} className="bg-[#0f172a]">{c}</option>)}
                  </select>
                  <select
                    className="col-span-2 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-indigo-500 transition-all"
                    value={row.type}
                    onChange={e => updateRow(row._id, 'type', e.target.value)}
                  >
                    <option value="veg" className="bg-[#0f172a]">🟢 Veg</option>
                    <option value="non-veg" className="bg-[#0f172a]">🔴 Non-Veg</option>
                  </select>
                  <button onClick={() => removeRow(row._id)} className="col-span-1 w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/25 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Template Download */}
          <div className="flex items-center gap-4 px-8 py-5 bg-indigo-500/10 border border-indigo-500/20 rounded-[32px]">
            <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">
              Tip: Use columns <span className="text-indigo-400">Name, Price, Category, Type</span> in your spreadsheet for best results.
            </p>
          </div>
        </div>
      )}

      {/* STEP: UPLOADING */}
      {step === 'uploading' && (
        <div className="bg-white/5 border border-white/10 rounded-[56px] p-20 flex flex-col items-center gap-10">
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
          <div className="w-full max-w-md">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
              <span>Syncing to Catalog Matrix</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Do not close this window...</p>
        </div>
      )}

      {/* STEP: DONE */}
      {step === 'done' && (
        <div className="bg-white/5 border border-white/10 rounded-[56px] p-20 flex flex-col items-center gap-10">
          <CheckCircle2 className="w-20 h-20 text-emerald-400" />
          <div className="text-center">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">Import Complete</h2>
            <div className="flex gap-8 justify-center">
              <div className="px-8 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <p className="text-3xl font-black text-emerald-400">{uploadResults.success}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Items Added</p>
              </div>
              {uploadResults.failed > 0 && (
                <div className="px-8 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                  <p className="text-3xl font-black text-rose-400">{uploadResults.failed}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">Failed</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-6">
            <button onClick={reset} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-white/10 transition-all">Upload More</button>
            <button onClick={() => window.location.hash = '#menu'} className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-black uppercase tracking-widest text-[10px] italic text-white shadow-xl hover:scale-[1.03] transition-all">View Catalog</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartUpload;
