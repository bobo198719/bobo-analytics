import express from "express";
import pg from "pg";
import cors from "cors";

// Use PG Pool for high-performance connections
const { Pool } = pg;

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" })); // Phase 8 FIX

/* ================= DATABASE ================= */

const pool = new Pool({
  user: "bobo",
  host: "localhost",
  database: "restaurant_crm",
  password: "Princy@20201987",
  port: 5432,
});

/* ================= DASHBOARD API ================= */

app.get("/api/dashboard", async (req, res) => {
  try {
    const revenue = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status='completed'"
    );

    const orders = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE DATE(created_at)=CURRENT_DATE"
    );

    const tables = await pool.query(
      "SELECT COUNT(*) FROM tables WHERE status!='available'"
    );

    const kitchen = await pool.query(
      "SELECT COUNT(*) FROM orders WHERE status IN ('pending','preparing')"
    );

    // Phase 1 Fix: 7-Day Revenue Matrix (Stable date-grouping)
    const history = await pool.query(`
      SELECT TO_CHAR(date_trunc('day', created_at), 'Dy') as date, 
             COALESCE(SUM(total_amount), 0) as total
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      AND status = 'completed'
      GROUP BY date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at)
    `);

    // Phase 10 Fix: Kitchen Pulse (Recent active orders)
    const recent = await pool.query(`
      SELECT o.id, o.status, o.created_at, t.table_number
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      WHERE o.status != 'completed' 
      ORDER BY o.created_at DESC 
      LIMIT 5
    `);

    res.json({
      total_revenue: Number(revenue.rows[0].total),
      orders_today: Number(orders.rows[0].count),
      active_tables: Number(tables.rows[0].count),
      kitchen_queue: Number(kitchen.rows[0].count),
      history: history.rows.map(r => ({ date: r.date, total: Number(r.total) })),
      recent: recent.rows
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Dashboard error" });
  }
});

/* ================= SEED DATA ================= */

app.get("/api/seed", async (req, res) => {
  try {
    // Phase 3 Fix: Verify and Seed (Include GST as required by schema)
    await pool.query(`
      INSERT INTO tables (table_number, status)
      VALUES (1,'available'),(2,'occupied'),(3,'ordered'),(4,'available')
      ON CONFLICT (table_number) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO orders (table_id, status, total_amount, gst_amount, created_at)
      VALUES
      (1, 'completed', 1200, 60, NOW()),
      (2, 'pending', 800, 40, NOW()),
      (3, 'preparing', 600, 30, NOW())
      ON CONFLICT DO NOTHING;
    `);

    res.json({ message: "Seed data added" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: "Seed error" });
  }
});

/* ================= TEST API ================= */

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working" });
});

/* ================= FRONTEND DIAGNOSTIC ================= */

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Restaurant Intelligence Terminal</title>
    <style>
      body { background:#0b0f1a; color:white; font-family:sans-serif; text-align:center; padding:50px; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1000px; margin: 40px auto; }
      .card { background:#111827; padding:30px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); }
      h1 { color:orange; font-weight:900; font-style:italic; }
      h2 { font-size: 32px; color: #f97316; }
      button { background:orange; color:white; border:none; padding:15px 30px; border-radius:8px; font-weight:bold; cursor:pointer; margin-top: 20px; }
    </style>
  </head>
  <body>
    <h1>Restaurant Intelligence Dashboard</h1>
    <div class="grid">
      <div class="card"><h3>Revenue</h3><h2 id="rev">0</h2></div>
      <div class="card"><h3>Orders</h3><h2 id="ord">0</h2></div>
      <div class="card"><h3>Active Tables</h3><h2 id="tab">0</h2></div>
      <div class="card"><h3>Kitchen Queue</h3><h2 id="kit">0</h2></div>
    </div>
    <button onclick="seed()">Execute Diagnostic Seed</button>
    <script>
      function loadData() {
        fetch('/api/dashboard').then(r=>r.json()).then(d=>{
          document.getElementById('rev').innerText = '₹' + d.total_revenue;
          document.getElementById('ord').innerText = d.orders_today;
          document.getElementById('tab').innerText = d.active_tables;
          document.getElementById('kit').innerText = d.kitchen_queue;
        }).catch(err => console.error(err));
      }
      function seed() { fetch('/api/seed').then(()=>loadData()); }
      loadData(); setInterval(loadData, 3000);
    </script>
  </body>
  </html>
  `);
});

/* ================= MENU APIs ================= */

app.get("/api/menu", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu_items ORDER BY category, name");
    
    // Phase 5 Fix: Image Fallbacks
    const items = result.rows.map(item => {
      if (!item.image_url || item.image_url.trim() === '') {
        const name = item.name.toLowerCase();
        if (name.includes('pizza')) item.image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591';
        else if (name.includes('burger')) item.image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd';
        else if (name.includes('coffee')) item.image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93';
        else if (name.includes('pasta')) item.image_url = 'https://images.unsplash.com/photo-1546548970-71785318a17b';
        else item.image_url = '/images/default_food.jpg';
      }
      return item;
    });

    res.json(items);
  } catch (err) { res.status(500).json({ error: "Menu fetch error" }); }
});

app.post("/api/menu", async (req, res) => {
  const { name, category, type, price, image_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO menu_items (name, category, type, price, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, category, type, price, image_url || '']
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Menu save error" }); }
});

/* ================= TABLE APIs ================= */

app.get("/api/tables", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tables ORDER BY table_number");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "Table fetch error" }); }
});

app.post("/api/tables", async (req, res) => {
  const { table_number } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tables (table_number, status) VALUES ($1, 'available') RETURNING *",
      [table_number]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Table save error" }); }
});

/* ================= ORDER APIs ================= */

app.post("/api/orders", async (req, res) => {
  const { table_id, items } = req.body;
  if (!table_id || !items || items.length === 0) {
    return res.status(400).json({ error: "Table and Items are required" });
  }

  try {
    // Phase 1: Fix Order Flow
    let total_amount = 0;
    for (const item of items) {
      const menuRes = await pool.query("SELECT price FROM menu_items WHERE id = $1", [item.menu_item_id]);
      if (menuRes.rows[0]) {
        total_amount += Number(menuRes.rows[0].price) * item.quantity;
      }
    }
    const gst_amount = total_amount * 0.05;

    const orderRes = await pool.query(
      "INSERT INTO orders (table_id, status, total_amount, gst_amount) VALUES ($1, 'pending', $2, $3) RETURNING *",
      [table_id, total_amount, gst_amount]
    );
    const order_id = orderRes.rows[0].id;

    for (const item of items) {
       const menuResult = await pool.query("SELECT price FROM menu_items WHERE id = $1", [item.menu_item_id]);
       const price = menuResult.rows[0]?.price || 0;
       const total = price * item.quantity;
       await pool.query(
         "INSERT INTO order_items (order_id, menu_item_id, quantity, price, total) VALUES ($1, $2, $3, $4, $5)",
         [order_id, item.menu_item_id, item.quantity, price, total]
       );
    }

    // Update table to occupied
    await pool.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);

    res.json({ message: "Order created", order_id });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: "Order creation error", details: err.message, stack: err.stack }); 
  }
});

app.get("/api/orders", async (req, res) => {
  const { status } = req.query;
  try {
    // Phase 3: Fix Table Sync (Get only active orders for KDS/Tables)
    let query = `
      SELECT o.*, t.table_number,
      json_agg(json_build_object('name', mi.name, 'quantity', oi.quantity)) as items
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items mi ON oi.menu_item_id = mi.id
    `;
    if (status) query += ` WHERE o.status = '${status}'`;
    else query += ` WHERE o.status != 'completed'`;
    
    query += ` GROUP BY o.id, t.table_number ORDER BY o.created_at DESC`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: "Orders fetch error" }); 
  }
});

app.put("/api/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    // Phase 2: Fix Kitchen Status Flow
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
    
    if (status === 'completed') {
      await pool.query(`
        UPDATE tables SET status = 'available' 
        WHERE id = (SELECT table_id FROM orders WHERE id = $1)
      `, [id]);
    } else {
      await pool.query(`
        UPDATE tables SET status = 'occupied' 
        WHERE id = (SELECT table_id FROM orders WHERE id = $1)
      `, [id]);
    }

    res.json({ message: "Status updated" });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: "Status update error" }); 
  }
});

/* ================= DASHBOARD API ================= */
// (Already exists as /api/dashboard)

/* ================= START SERVER ================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
