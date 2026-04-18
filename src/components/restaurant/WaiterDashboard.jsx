import React, { useState, useEffect } from 'react';
import { LayoutGrid, CheckCircle, XCircle, Clock, Utensils, AlertCircle } from 'lucide-react';

export default function WaiterDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('/api/v2/restaurant/orders?active_only=true');
      let data = await res.json();
      data = (data.orders || []).filter(o => o.status === 'placed');
      console.log("QR Orders from API:", data);
      setOrders(data);
      setLoading(false);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to fetch pending orders:", err);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const approveOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/v2/restaurant/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'waiter_confirmed' })
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
    } catch (err) {
      alert("Failed to confirm order.");
    }
  };

    const rejectOrder = async (orderId) => {
    if (!confirm("Reject this order request?")) return;
    try {
      await fetch(`/api/v2/restaurant/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert("Failed to reject order.");
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/20">
        <Clock className="w-12 h-12 mb-4 animate-pulse" />
        <p className="text-xs font-black uppercase tracking-widest italic">Syncing with Table Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans']">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Waiter <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">Intelligence</span>
          </h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">Order Approval Terminal | V2.1</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 italic">Live Sync Active</p>
          <p className="text-[9px] text-white/20 font-mono mt-1 uppercase">Last Node Refresh: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-20 text-center">
          <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-orange-500/40" />
          </div>
          <h2 className="text-xl font-black italic uppercase text-white/60">Queue Clear</h2>
          <p className="text-white/20 text-xs mt-2 uppercase tracking-widest font-bold">Waiting for customer requests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden hover:bg-white/[0.08] transition-all group flex flex-col">
              <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black italic text-lg shadow-lg shadow-orange-600/20">
                    {order.table_id || '#'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black italic uppercase text-white">Table {order.table_id}</h3>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{new Date(order.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[9px] font-black uppercase text-orange-500 italic">
                  New Request
                </div>
              </div>

              <div className="p-6 flex-1 space-y-4">
                <div className="space-y-2">
                  {(() => {
                    let parsedItems = [];
                    try {
                      parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                    } catch(e) {}
                    return parsedItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-start gap-4 p-3 bg-black/20 rounded-2xl border border-white/5">
                        <div>
                          <p className="text-[11px] font-black uppercase italic text-white/80">
                            {item.menu_name || item.name || `Item #${item.menu_item_id || '?'}`} <span className="text-orange-500">×{item.quantity}</span>
                          </p>
                          {item.special_instructions && (
                            <p className="text-[9px] text-rose-400 font-bold italic mt-1 leading-relaxed">↳ "{item.special_instructions}"</p>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-white/40">₹{item.total || (item.price ? item.price * item.quantity : 0)}</p>
                      </div>
                    ));
                  })()}
                </div>

                {order.special_notes && (
                  <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black uppercase text-orange-400 tracking-wider mb-1 italic">Global Note</p>
                      <p className="text-[10px] text-white/60 font-semibold italic">"{order.special_notes}"</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 pt-0 mt-auto grid grid-cols-2 gap-4">
                <button 
                  onClick={() => rejectOrder(order.id)}
                  className="py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-white/30 hover:text-rose-500"
                >
                  <XCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase italic">Reject</span>
                </button>
                <button 
                  onClick={() => approveOrder(order.id)}
                  className="py-4 bg-orange-500 hover:bg-orange-400 border border-orange-400 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all text-black"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase italic">Confirm Order</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
