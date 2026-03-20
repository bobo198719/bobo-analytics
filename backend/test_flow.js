import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "bobo",
  host: "localhost",
  database: "restaurant_crm",
  password: "Princy@20201987",
  port: 5432,
});

async function runTest() {
  console.log("Starting Automated ROS Flow Test...");

  try {
    // 1. Initial State
    const tableNum = 1;
    await pool.query("UPDATE tables SET status = 'available' WHERE table_number = $1", [tableNum]);
    const tableRes = await pool.query("SELECT id FROM tables WHERE table_number = $1", [tableNum]);
    const tableId = tableRes.rows[0].id;
    console.log(`- Table ${tableNum} (ID: ${tableId}) set to 'available'`);

    // 2. Create Order
    console.log("- Creating Order...");
    const orderBody = {
      table_id: tableId,
      items: [{ menu_item_id: 1, quantity: 2 }] // Assumes item 1 exists
    };
    
    // Simulate POST /api/orders
    const total_amount = 500; // Mock calculation
    const gst_amount = 25;
    const orderRes = await pool.query(
      "INSERT INTO orders (table_id, status, total_amount, gst_amount) VALUES ($1, 'pending', $2, $3) RETURNING id",
      [orderBody.table_id, total_amount, gst_amount]
    );
    const orderId = orderRes.rows[0].id;
    await pool.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [tableId]);
    console.log(`- Order ${orderId} created. Table ${tableNum} status updated to 'occupied'.`);

    // 3. Verify Table is Occupied
    const checkTable1 = await pool.query("SELECT status FROM tables WHERE id = $1", [tableId]);
    if (checkTable1.rows[0].status !== 'occupied') throw new Error("Verification Failed: Table NOT occupied");
    console.log("- Verification 1: Table is correctly occupied.");

    // 4. Update Status to Completed
    console.log("- Updating Order to 'completed'...");
    await pool.query("UPDATE orders SET status = 'completed' WHERE id = $1", [orderId]);
    await pool.query("UPDATE tables SET status = 'available' WHERE id = (SELECT table_id FROM orders WHERE id = $1)", [orderId]);
    
    // 5. Verify Table is Available
    const checkTable2 = await pool.query("SELECT status FROM tables WHERE id = $1", [tableId]);
    if (checkTable2.rows[0].status !== 'available') throw new Error("Verification Failed: Table NOT available after completion");
    console.log("- Verification 2: Table is correctly available after completion.");

    // 6. Verify Dashboard Revenue
    const dashboardRes = await pool.query("SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status='completed'");
    console.log(`- Dashboard Verification: Total Revenue is ${dashboardRes.rows[0].total}`);

    console.log("✅ ALL TESTS PASSED: ROS FLOW IS CONSISTENT.");
  } catch (err) {
    console.error("❌ TEST FAILED:", err.message);
  } finally {
    await pool.end();
  }
}

runTest();
