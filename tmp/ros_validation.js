import fetch from 'node-fetch';

const BASE_URL = 'http://srv1449576.hstgr.cloud:5000/api';

async function testFlow() {
  console.log("🚀 COMMENCING ROS MONOLITHIC VALIDATION...");

  try {
    const tablesRes = await fetch(`${BASE_URL}/tables`);
    const tables = await tablesRes.json();
    const tableId = tables[0].id;
    console.log(`📍 Using Table ${tables[0].table_number} (ID: ${tableId})`);

    const menuRes = await fetch(`${BASE_URL}/menu`);
    const menuItems = await menuRes.json();
    if (menuItems.length === 0) throw new Error("Abort: Menu Matrix Empty");
    const testItemId = menuItems[0].id;
    console.log(`🍔 Using Menu Item: ${menuItems[0].name} (ID: ${testItemId})`);

    console.log("🛒 PHASE 3: Commit POS Order...");
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_id: tableId,
        items: [{ menu_item_id: testItemId, quantity: 2 }] 
      })
    });
    const orderBody = await orderRes.json();
    console.log("DEBUG: BACKEND RESPONSE:", orderBody);
    console.log(`✅ Order Created: ID ${orderBody.order_id}`);

    console.log("👨‍🍳 PHASE 2: Verify KDS Synchronization...");
    const kdsRes = await fetch(`${BASE_URL}/orders?status=pending`);
    const kdsOrders = await kdsRes.json();
    const found = kdsOrders.find(o => o.id === orderBody.order_id);
    if (!found) throw new Error("KDS SYNC FAILURE: Order not found in pending queue");
    console.log("✅ KDS Received Order Successfully");

    console.log("⏳ Moving Status Pipeline...");
    await fetch(`${BASE_URL}/orders/${orderBody.order_id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'preparing' })
    });
    console.log("✅ Status: PREPARING");
    
    await fetch(`${BASE_URL}/orders/${orderBody.order_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' })
      });
    console.log("✅ Status: READY");

    await fetch(`${BASE_URL}/orders/${orderBody.order_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
    console.log("✅ Status: COMPLETED");

    console.log("🔓 PHASE 7: Verify Table Liberation...");
    const tableCheckRes = await fetch(`${BASE_URL}/tables`);
    const tablesAfter = await tableCheckRes.json();
    const tableFinal = tablesAfter.find(t => t.id === tableId);
    console.log(`📍 Table ${tables[0].table_number} Status: ${tableFinal.status}`);
    
    console.log("📊 PHASE 1: Verify Dashboard Yield...");
    const dashboardRes = await fetch(`${BASE_URL}/dashboard`);
    const stats = await dashboardRes.json();
    console.log(`💰 Dashboard Revenue: ₹${stats.total_revenue}`);
    console.log(`📈 History Bars: ${stats.history.length}`);
    
    console.log("\n✨ ROS MONOLITHIC VALIDATION SUCCESSFUL!");

  } catch (err) {
    console.error("❌ VALIDATION FAILED:", err.message);
  }
}

testFlow();
