import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Camera, 
  Trash2, 
  Edit3,
  BookOpen,
  Layers,
  IndianRupee,
  CheckCircle2
} from 'lucide-react';

const MenuManager = () => {
  const [categories, setCategories] = useState(['Starters', 'Main Course', 'Beverages', 'Desserts']);
  const [items, setItems] = useState([
    { id: 1, name: 'Paneer Tikka', price: 280, type: 'veg', category: 'Starters', status: 'available' },
    { id: 2, name: 'Butter Chicken', price: 450, type: 'non-veg', category: 'Main Course', status: 'available' },
    { id: 3, name: 'Gulab Jamun', price: 120, type: 'veg', category: 'Desserts', status: 'available' }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Cloud Catalog</h1>
          <p className="text-white/50 mt-1 uppercase text-xs font-bold tracking-[0.2em]">Digital Menu & QR Inventory Control</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => setShowAddModal(true)} className="px-8 py-4 bg-bobo-accent rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl shadow-bobo-accent/20 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95">
              <Plus className="w-5 h-5" />
              Provision Item
           </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Category List */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Categories</h3>
                <button className="text-bobo-accent hover:text-white transition-colors"><Layers className="w-4 h-4" /></button>
             </div>
             <div className="space-y-2">
                {categories.map((cat, i) => (
                  <button key={i} className={`w-full text-left p-4 rounded-2xl font-black text-sm transition-all group flex justify-between items-center ${i === 0 ? 'bg-bobo-accent/10 border border-bobo-accent/20 text-bobo-accent' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}>
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-20 group-hover:opacity-100">{items.filter(it => it.category === cat).length}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-white/5 rounded-[32px] p-8 mt-4">
             <BookOpen className="text-indigo-400 mb-4 w-8 h-8" />
             <h4 className="font-black text-lg mb-2">Sync QR Ordering</h4>
             <p className="text-xs text-white/40 leading-relaxed font-medium">Auto-generate QR codes for every table once items are provisioned.</p>
          </div>
        </aside>

        {/* Item Catalog */}
        <div className="lg:col-span-3 space-y-8">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-6 h-6 group-focus-within:text-bobo-accent transition-colors" />
              <input type="text" placeholder="Search Master Catalog Intelligence..." className="w-full bg-white/5 border border-white/10 p-6 pl-16 rounded-3xl text-sm font-bold placeholder:text-white/10 outline-none focus:border-bobo-accent focus:bg-white/[0.08] transition-all" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex gap-8 items-center hover:border-white/20 transition-all group relative overflow-hidden">
                   <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform bg-opacity-30 backdrop-blur-sm z-10 shrink-0">
                      {item.type === 'veg' ? '🥗' : '🍗'}
                   </div>

                   <div className="flex-1 z-10">
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="text-2xl font-black italic tracking-tight">{item.name}</h3>
                         <div className={`w-3 h-3 rounded-full ${item.type === 'veg' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'} shadow-lg`}></div>
                      </div>
                      <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">{item.category}</p>
                      
                      <div className="flex items-center gap-4 text-sm font-black">
                         <div className="flex items-center gap-1.5 text-emerald-400">
                           <IndianRupee className="w-3.5 h-3.5" />
                           {item.price}
                         </div>
                         <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                         <div className="text-white/30 uppercase text-[10px] tracking-widest">5% GST Applied</div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-3 relative z-10">
                      <button className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>

                   <div className="absolute top-0 right-0 w-32 h-32 bg-bobo-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-bobo-accent/10 transition-all"></div>
                </div>
              ))}
              
              <div className="border-4 border-dashed border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 text-white/20 hover:text-white/30 hover:border-white/10 transition-all cursor-pointer group">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Plus /></div>
                 <p className="font-black italic uppercase tracking-widest text-[10px]">Add Terminal Item</p>
              </div>
           </div>
        </div>
      </section>

      {/* Mock Modal for Add */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#05081a]/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-6 animate-in fade-in transition-all">
           <div className="w-full max-w-xl bg-white/5 border border-white/10 p-12 rounded-[56px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-bobo-accent opacity-10 blur-[100px] -mt-32"></div>
              
              <header className="mb-10 text-center">
                 <h2 className="text-3xl font-black italic mb-2 uppercase">Provision Intelligent Item</h2>
                 <p className="text-white/30 text-sm font-medium tracking-tight">Syncing new item to Cloud POS Cloud Terminal.</p>
              </header>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-3 pl-1">Item Title</label>
                    <input type="text" placeholder="e.g. Kashmiri Dum Aloo" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-bobo-accent transition-all text-sm font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-3 pl-1">Unit Price</label>
                        <input type="number" placeholder="₹ 320" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-bobo-accent transition-all text-sm font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-white/30 tracking-widest block mb-3 pl-1">Classification</label>
                        <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-bobo-accent transition-all text-sm font-bold text-white/50">
                            <option>Vegetarian</option>
                            <option>Non-Vegetarian</option>
                            <option>Beverage</option>
                        </select>
                    </div>
                 </div>
              </div>

              <div className="mt-12 flex gap-4">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-5 bg-white/5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5">Abort</button>
                 <button className="flex-1 py-5 bg-bobo-accent rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-bobo-accent/20 hover:scale-[1.02] transition-all">Submit Sync</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
