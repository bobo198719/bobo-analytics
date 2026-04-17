import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  Zap,
  Tag,
  Database,
  ArrowRight,
  ChevronDown,
  Filter
} from 'lucide-react';
import ImagePicker from './ImagePicker.jsx';

const MenuManager = () => {
  const [categories, setCategories] = useState(['All', 'Starters', 'Mains', 'Beverages', 'Desserts', 'Chef Specials']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Starters', type: 'veg', image_url: '' });
  const [editItem, setEditItem] = useState(null); // item being edited
  const [editForm, setEditForm] = useState({ name: '', price: '', category: 'Starters', type: 'veg', image_url: '' });
  const [deletingId, setDeletingId] = useState(null); // track which item is being deleted
  const pendingItems = useRef([]); // locally-added items not yet confirmed by server
  const deletedIds = useRef(new Set(
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ro_deleted_ids') || '[]') : []
  ));
  const editedItems = useRef(new Map(
    typeof window !== 'undefined' ? Object.entries(JSON.parse(localStorage.getItem('ro_edited_items') || '{}')) : []
  ));

  // Persist helpers
  const saveDeletedIds = (set) => {
    try { localStorage.setItem('ro_deleted_ids', JSON.stringify([...set])); } catch(e) {}
  };
  const saveEditedItems = (map) => {
    try {
      const obj = {};
      map.forEach((v, k) => {
        // Don't store huge base64 images in localStorage (keep only http URLs)
        obj[k] = { ...v, image_url: v.image_url?.startsWith('data:') ? '___base64___' : v.image_url };
      });
      localStorage.setItem('ro_edited_items', JSON.stringify(obj));
    } catch(e) {}
  };

  const searchRef = useRef(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/v2/restaurant/menu');
      if (!res.ok) throw new Error("Catalog Matrix Offline");
      const data = await res.json();
      const sorted = [...data].sort((a, b) => b.id - a.id);
      const serverNames = new Set(data.map(d => d.name?.toLowerCase().trim()));
      // Remove pending items that now exist in server data
      pendingItems.current = pendingItems.current.filter(
        p => !serverNames.has(p.name?.toLowerCase().trim())
      );
      // Filter out any deleted items
      const notDeleted = sorted.filter(r => !deletedIds.current.has(String(r.id)));
      // Apply any local edits on top of server data
      const withEdits = notDeleted.map(r => {
        const localEdit = editedItems.current.get(String(r.id));
        // Don't apply base64 placeholder from localStorage (image was not persisted)
        if (localEdit && localEdit.image_url === '___base64___') {
          const { image_url, ...rest } = localEdit;
          return { ...r, ...rest };
        }
        return localEdit ? { ...r, ...localEdit } : r;
      });
      // Merge remaining pending items at top
      setItems([...pendingItems.current, ...withEdits].slice(0, 253));
      setLoading(false);
    } catch (err) { 
      console.error("Fetch Fail:", err); 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = async () => {
    if (!formData.name || !formData.price || !formData.category) return alert("Please fill all fields");
    
    const newItem = {
        ...formData,
        id: Date.now(), // temporary local ID
        price: Number(formData.price)
    };

    // Optimistically add to pending list and UI immediately
    pendingItems.current = [newItem, ...pendingItems.current];
    setItems(prev => [newItem, ...prev]);
    setShowAddModal(false);
    setFormData({ name: '', category: 'Starters', price: '', type: 'veg', image_url: '' });

    try {
        const res = await fetch('/api/v2/restaurant/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (res.ok) {
            // Server confirmed — do a fresh fetch which will also clean pendingItems
            fetchItems();
        } else {
            console.warn("Backend save failed, dish is shown locally only.");
        }
    } catch (err) { 
        console.error("Add dish network error:", err);
        // Item already added to UI, will persist until next hard reload
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);

    // Permanently mark as deleted on this client session
    deletedIds.current.add(String(item.id));
    saveDeletedIds(deletedIds.current);
    // Optimistic: remove from UI and pending list immediately
    setItems(prev => prev.filter(it => it.id !== item.id));
    pendingItems.current = pendingItems.current.filter(p => p.id !== item.id);

    try {
      const res = await fetch(`/api/v2/restaurant/menu/${item.id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 404) {
        // Try PATCH as a soft-delete fallback if DELETE is blocked
        await fetch(`/api/v2/restaurant/menu/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deleted: true })
        });
      }
    } catch (err) {
      console.error('Delete API error (item already removed from UI):', err);
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      price: item.price,
      category: item.category,
      type: item.type || 'veg',
      image_url: item.image_url || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.price) return alert('Please fill all required fields');
    const idStr = String(editItem.id);
    const savedForm = { ...editForm };
    // Immediately store the edit locally so it survives server refreshes
    editedItems.current.set(idStr, savedForm);
    saveEditedItems(editedItems.current);
    setItems(prev => prev.map(it => it.id === editItem.id ? { ...it, ...savedForm } : it));
    setEditItem(null);

    try {
      const res = await fetch(`/api/v2/restaurant/menu/${idStr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedForm)
      });
      if (res.ok) {
        // Server confirmed — edit is persisted in DB, remove local override
        editedItems.current.delete(idStr);
        saveEditedItems(editedItems.current);
      }
    } catch (err) {
      console.error('Edit sync error (local edit preserved via localStorage):', err);
    }
  };

  // Build a reliable image URL:
  // 1. Trust the DB-stored URL first
  // 2. If missing, use Unsplash keyword search (reliable fallback)
  const getImageUrl = (item) => {
    if (item.image_url && (item.image_url.startsWith('http') || item.image_url.startsWith('data:'))) return item.image_url;
    // Keyword-based fallback map
    const kwMap = {
      'Starters': 'food,appetizer,starter',
      'Main Course': 'food,main,course,curry',
      'Beverages': 'drink,juice,beverage',
      'Desserts': 'dessert,cake,sweet',
    };
    const kw = kwMap[item.category] || 'food';
    return `https://source.unsplash.com/300x300/?${kw}`;
  };

  const filteredItems = items.filter(it => 
    (activeCategory === 'All' || it.category === activeCategory) &&
    (searchTerm === '' || it.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const searchMatches = items.filter(it => 
    searchTerm.length > 1 && it.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const role = typeof window !== 'undefined' ? localStorage.getItem('ro_role') || 'owner' : 'owner';
  const isOwner = role === 'owner';

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-['Plus_Jakarta_Sans']">
      
      {/* Header Core */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/5 border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase leading-none">Catalog <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">Intelligence</span></h1>
          <p className="text-white/30 mt-3 uppercase text-[10px] font-black tracking-[0.4em] italic leading-none">Global Master Menu Database | {items.length} Elements Linked</p>
        </div>
        <div className="flex gap-4 relative z-10">
           {isOwner && (
           <button onClick={() => setShowAddModal(true)} className="px-10 py-5 bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl font-black italic uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-orange-600/30 flex items-center gap-4 transition-all hover:scale-[1.05] active:scale-95 border border-orange-400/20">
              <Plus className="w-5 h-5" />
              Provision Master Node
           </button>
           )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-all"></div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-12 pb-20">
        
        {/* Sidebar Console */}
        <aside className="lg:col-span-1 flex flex-col gap-10">
          <div className="bg-white/5 border border-white/10 rounded-[48px] p-8 relative overflow-hidden group shadow-2xl">
             <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Layer Groups</h3>
                <Filter className="w-4 h-4 text-orange-500" />
             </div>
             <div className="space-y-3 relative z-10">
                {categories.map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left p-5 rounded-3xl font-black italic text-xs transition-all group flex justify-between items-center border ${activeCategory === cat ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-500/10' : 'bg-transparent border-white/5 text-white/20 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className="tracking-widest uppercase">{cat}</span>
                    <span className="text-[10px] bg-white/10 px-3 py-1.5 rounded-xl font-black">
                      {cat === 'All' ? items.length : items.filter(it => it.category === cat).length}
                    </span>
                  </button>
                ))}
                <button className="w-full p-5 border-2 border-dashed border-white/5 rounded-3xl text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-white/30 hover:border-white/10 transition-all italic">+ Custom Cluster</button>
             </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[48px] p-10 relative overflow-hidden group">
             <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-500/20"><Database className="w-7 h-7" /></div>
             <h4 className="font-black italic text-xl mb-3 tracking-tight">Persistence Node</h4>
             <p className="text-[10px] text-white/20 leading-relaxed font-black uppercase tracking-widest italic">All catalog items are securely stored on MariaDB VPS Node srv-144.</p>
          </div>
        </aside>

        {/* Main Interface */}
        <div className="lg:col-span-3 space-y-10">
           
           {/* Search & Intelligence Field */}
           <div className="relative group z-30" ref={searchRef}>
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 w-6 h-6 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="QUERY MASTER CATALOG INSTANCE..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full bg-white/5 border border-white/10 p-8 pl-18 rounded-[40px] text-xs font-black italic tracking-[0.2em] placeholder:text-white/10 outline-none focus:border-orange-500/50 focus:bg-white/[0.08] transition-all uppercase text-white" 
              />
              
              {/* DROPDOWN OPTIONS (The user requested this) */}
              {showSearchDropdown && searchTerm.length > 1 && (
                <div className="absolute top-full left-0 w-full mt-4 bg-[#0b0f24] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in slide-in-from-top-4 duration-300">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-[8px] font-black uppercase text-white/30 tracking-[0.3em] px-4 italic">Heuristic Matches Found</p>
                    </div>
                    {searchMatches.length === 0 ? (
                      <div className="p-10 text-center text-white/20 italic font-black text-[10px] uppercase">No active nodes found matching query</div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                        {searchMatches.map((match, i) => (
                          <div 
                            key={i}
                            onClick={() => {
                              setSearchTerm(match.name);
                              setShowSearchDropdown(false);
                            }}
                            className="flex items-center justify-between p-6 hover:bg-orange-600/10 border-b border-white/5 group/match cursor-pointer transition-all"
                          >
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                   <img src={getImageUrl(match)} alt={match.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                   <h5 className="font-black italic uppercase text-sm group-hover/match:text-orange-400 transition-colors leading-none">{match.name}</h5>
                                   <p className="text-[8px] text-white/20 font-black uppercase mt-2 italic tracking-widest">{match.category} :: ₹{match.price}</p>
                                </div>
                             </div>
                             <ArrowRight className="w-4 h-4 text-white/10 group-hover/match:text-orange-500 group-hover/match:translate-x-1 transition-all" />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
           </div>

           {/* Grid Layout (Phase 6: Real Images) */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-6 text-white/20 animate-pulse">
                   <Zap className="w-16 h-16" />
                   <p className="font-black italic uppercase tracking-[0.5em] text-xs">Catalog Linkage In Progress...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-6 text-white/10">
                   <Filter className="w-16 h-16" />
                   <p className="font-black italic uppercase tracking-[0.3em] text-[10px]">No elements found in current matrix plane</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                    <div key={item.id} className="bg-white/10 border border-white/20 p-6 rounded-3xl flex gap-6 items-center hover:bg-white/[0.13] hover:border-orange-500/40 transition-all group relative shadow-2xl">
                     
                     {/* DISH IMAGE — fixed key + alt-based onError */}
                     <div className="w-28 h-28 bg-[#05081a] border border-white/10 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform shrink-0 shadow-xl relative">
                        <img 
                          src={getImageUrl(item)} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          onError={(e) => {
                             e.target.onerror = null;
                             const dishName = e.target.getAttribute('alt') || 'Dish';
                             e.target.style.display = 'none';
                             const fb = document.createElement('div');
                             fb.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:12px;text-align:center;background:linear-gradient(135deg,rgba(234,88,12,0.25),rgba(244,63,94,0.25))';
                             fb.innerHTML = `<p style="font-size:9px;font-weight:900;text-transform:uppercase;color:rgba(255,255,255,0.65);font-style:italic;line-height:1.3;word-break:break-word;">${dishName}</p>`;
                             e.target.parentNode.appendChild(fb);
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm p-1.5 text-center pointer-events-none">
                           <p className="text-[6px] font-black uppercase text-white/80 italic tracking-tighter leading-none truncate px-1">{item.name}</p>
                        </div>
                     </div>

                     {/* Text content — min-w-0 prevents flex overflow clipping */}
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 min-w-0">
                           <h3 className="text-base font-black italic uppercase tracking-tight leading-tight group-hover:text-orange-400 transition-colors text-white truncate">{item.name}</h3>
                           <div className={`w-3 h-3 rounded-full shrink-0 ${item.type === 'veg' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'}`}></div>
                        </div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-3 italic">{item.category}</p>
                        
                        <div className="flex items-center gap-3">
                           <p className="text-lg font-black italic text-orange-400">₹{item.price}</p>
                           <span className="text-[7px] text-white/20 font-black uppercase tracking-widest shrink-0">SYNC READY</span>
                        </div>
                     </div>

                     {/* Action buttons — wired up with real handlers */}
                     {isOwner && (
                     <div className="flex flex-col gap-2 shrink-0">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400/60 hover:text-blue-300 hover:bg-blue-500/25 transition-all" 
                          title="Edit dish"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item)}
                          disabled={deletingId === item.id}
                          className="w-9 h-9 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/25 transition-all disabled:opacity-30" 
                          title="Delete dish"
                        >
                          {deletingId === item.id ? <span className="text-[8px] animate-spin">⟳</span> : <Trash2 className="w-4 h-4" />}
                        </button>
                     </div>
                     )}
                  </div>
                ))
              )}
              
              {isOwner && (
              <div onClick={() => setShowAddModal(true)} className="h-44 border-4 border-dashed border-white/5 rounded-[56px] flex flex-col items-center justify-center gap-6 text-white/10 hover:text-orange-400/40 hover:border-orange-500/20 transition-all cursor-pointer group hover:bg-orange-500/5">
                 <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all border border-white/5"><Plus /></div>
                 <p className="font-black italic uppercase tracking-[0.3em] text-[10px]">Deploy New Terminal Node</p>
              </div>
              )}
           </div>
        </div>
      </section>

      {/* Provisioning Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#05081a]/95 backdrop-blur-3xl z-[99999] flex items-center justify-center p-4 overflow-y-auto">
           <div className="w-full max-w-2xl bg-[#0b0f24] border border-white/10 p-8 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden my-auto">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-rose-600"></div>
              <header className="mb-8 text-center">
                 <h2 className="text-2xl font-black italic mb-1 uppercase tracking-tighter">Add <span className="text-orange-400">New Dish</span></h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] italic">Catalog Sync Engine</p>
              </header>
              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Dish Name *</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm text-white" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Butter Chicken" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Price (₹) *</label>
                       <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm text-white" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="350" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Category *</label>
                       <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm text-white" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                          {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-[#0b0f24]">{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Type</label>
                    <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-sm text-white" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                       <option value="veg" className="bg-[#0b0f24]">🟢 Vegetarian</option>
                       <option value="non-veg" className="bg-[#0b0f24]">🔴 Non-Vegetarian</option>
                    </select>
                 </div>
                 {/* Image Picker */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Dish Image</label>
                    <ImagePicker
                      value={formData.image_url}
                      onChange={(url) => setFormData({...formData, image_url: url})}
                      dishName={formData.name}
                    />
                 </div>
              </div>
              <div className="mt-8 flex gap-4">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-white/10 transition-all">Cancel</button>
                 <button onClick={handleAddItem} className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl font-black uppercase tracking-widest text-[10px] italic text-white shadow-xl hover:from-orange-500 hover:to-orange-400 transition-all">Add Dish</button>
              </div>
           </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 bg-[#05081a]/95 backdrop-blur-3xl z-[99999] flex items-center justify-center p-4 overflow-y-auto">
           <div className="w-full max-w-2xl bg-[#0b0f24] border border-blue-500/20 p-8 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden my-auto">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <header className="mb-8 text-center">
                 <h2 className="text-2xl font-black italic mb-1 uppercase tracking-tighter">Edit <span className="text-blue-400">{editItem.name.replace(/^[\p{Emoji}\s]+/u, '').trim()}</span></h2>
                 <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] italic">Modify dish details</p>
              </header>
              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Dish Name *</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm text-white" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Price (₹) *</label>
                       <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm text-white" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Category</label>
                       <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm text-white" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                          {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-[#0b0f24]">{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Type</label>
                    <select className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm text-white" value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})}>
                       <option value="veg" className="bg-[#0b0f24]">🟢 Vegetarian</option>
                       <option value="non-veg" className="bg-[#0b0f24]">🔴 Non-Vegetarian</option>
                    </select>
                 </div>
                 {/* Image Picker — Upload / Google / URL */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] block italic">Dish Image</label>
                    <ImagePicker
                      value={editForm.image_url}
                      onChange={(url) => setEditForm({...editForm, image_url: url})}
                      dishName={editForm.name}
                    />
                 </div>
              </div>
              <div className="mt-8 flex gap-4">
                 <button onClick={() => setEditItem(null)} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-white/10 transition-all">Cancel</button>
                 <button onClick={handleSaveEdit} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl font-black uppercase tracking-widest text-[10px] italic text-white shadow-xl hover:from-blue-500 hover:to-indigo-400 transition-all">Save Changes</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
