const express = require('express');
const router = express.Router();
const pg = require('../pg_db');

/**
 * 1. MENU APIs
 * GET /api/menu - Get all items
 * POST /api/menu - Add new item
 */
router.get('/menu', async (req, res) => {
    try {
        const { rows } = await pg.query('SELECT * FROM menu_items ORDER BY category ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/menu', async (req, res) => {
    try {
        const { name, category, type, price, gst_percent, image_url } = req.body;
        const { rows } = await pg.query(
            'INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, category, type, price, gst_percent || 5, image_url]
        );
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 2. ORDER CREATION (POS + QR)
 * POST /api/orders
 */
router.post('/orders', async (req, res) => {
    const client = await pg.pool.connect();
    try {
        await client.query('BEGIN');
        const { table_id, items, customer_id, special_notes, status = 'pending_waiter' } = req.body;
        console.log("Incoming Order:", req.body);

        // CRITICAL: Look up the real database ID for the table number provided
        // Handle both "01" and "1" cases
        const tableNum = table_id.toString();
        const tableNumInt = parseInt(tableNum).toString();

        const { rows: tableRows } = await client.query(
            'SELECT id FROM tables WHERE table_number = $1 OR table_number = $2', 
            [tableNum, tableNumInt]
        );
        
        if (tableRows.length === 0) {
            console.error("Table Lookup Failed for:", tableNum, tableNumInt);
            throw new Error(`Table ${table_id} not found in database.`);
        }
        const db_table_id = tableRows[0].id;

        // 1. Calculate Totals
        let total = 0;
        let gst = 0;
        const processedItems = [];

        // Ensure items is iterable
        let itemsList = items;
        if (typeof items === 'string') {
            try {
                itemsList = JSON.parse(items);
            } catch(e) {
                throw new Error("Invalid items structure: " + items);
            }
        }
        
        if (!itemsList || !Array.isArray(itemsList)) {
            throw new Error("Items must be a valid array. Received: " + typeof itemsList);
        }

        for (const item of itemsList) {
            const { rows } = await client.query('SELECT * FROM menu_items WHERE id = $1', [item.menu_item_id]);
            const mItem = rows[0];
            const itemTotal = mItem.price * item.quantity;
            const itemGst = itemTotal * (mItem.gst_percent / 100);
            
            total += itemTotal;
            gst += itemGst;
            processedItems.push({ 
                ...mItem, 
                quantity: item.quantity, 
                total: itemTotal, 
                special_instructions: item.special_instructions 
            });
        }

        // 2. Create Order (with Fallback for Missing Schema Column)
        let orderRows;
        try {
            const result = await client.query(
                'INSERT INTO orders (table_id, customer_id, status, total_amount, gst_amount, special_notes, items) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [db_table_id, customer_id || null, status, total + gst, gst, special_notes || '', JSON.stringify(processedItems)]
            );
            orderRows = result.rows;
        } catch (err) {
            if (err.message.includes('special_notes') && err.message.includes('does not exist')) {
                console.warn("⚠️ Legacy Schema Detected: Retrying order without special_notes.");
                const result = await client.query(
                    'INSERT INTO orders (table_id, customer_id, status, total_amount, gst_amount, items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [db_table_id, customer_id || null, status, total + gst, gst, JSON.stringify(processedItems)]
                );
                orderRows = result.rows;
            } else {
                throw err;
            }
        }
        const orderId = orderRows[0].id;

        // 3. Create Order Items
        for (const pItem of processedItems) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price, total, special_instructions) VALUES ($1, $2, $3, $4, $5, $6)',
                [orderId, pItem.id, pItem.quantity, pItem.price, pItem.total, pItem.special_instructions]
            );
        }

        // 4. Update Table Status
        await client.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [db_table_id]);

        await client.query('COMMIT');

        // Realtime Broadcast
        if (global.broadcastNewOrder) {
            global.broadcastNewOrder({ ...orderRows[0], items: processedItems });
        }

        res.json({ success: true, orderId, total: total + gst, status: orderRows[0].status });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Order error:", err);
        
        // 🔧 DIRECT HEAL: If Hostinger fails due to missing column, fix it NOW
        if (err.message && err.message.includes('special_notes')) {
            console.warn("Direct Heal: Adding missing 'special_notes' column on Hostinger...");
            try { await pg.pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT'); } catch(e) {}
            return res.status(500).json({ error: "DB_REPAIRED_TRY_AGAIN", info: "The database schema has been fixed on Hostinger. Please click 'Place Request' one last time." });
        }
        
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

/**
 * 3. ORDER FETCH
 * GET /api/orders - All orders
 * GET /api/orders?status=pending - Kitchen view
 */
router.get('/orders', async (req, res) => {
    try {
        // 🔧 AUTO-REPAIR: Add column if missing during dashboard visit
        try { await pg.pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT'); } catch(e) {}

        const { status } = req.query;
        console.log("Orders Fetch Request:", status);
        
        let sql = `
            SELECT o.*, t.table_number, 
            (SELECT json_agg(oi.*) FROM 
                (SELECT oi_inner.*, mi.name as menu_name FROM order_items oi_inner 
                 JOIN menu_items mi ON oi_inner.menu_item_id = mi.id 
                 WHERE oi_inner.order_id = o.id) oi
            ) as items
            FROM orders o
            JOIN tables t ON o.table_id = t.id
        `;
        
        const params = [];
        if (status) {
            sql += ` WHERE o.status = $1`;
            params.push(status);
        }
        
        sql += ` ORDER BY o.created_at DESC`;

        const { rows } = await pg.pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error("Fetch orders error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pg.query('SELECT status, created_at FROM orders WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Order not found" });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 4. ORDER STATUS UPDATE (KITCHEN)
 * PUT /api/orders/:id/status
 */
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, waiter_id } = req.body;

        if (waiter_id) {
            await pg.query('UPDATE orders SET status = $1, waiter_id = $2 WHERE id = $3', [status, waiter_id, id]);
        } else {
            await pg.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        }

        if (status === 'completed') {
            const { rows } = await pg.query('SELECT table_id FROM orders WHERE id = $1', [id]);
            if (rows[0]?.table_id) {
                await pg.query("UPDATE tables SET status = 'available' WHERE id = $1", [rows[0].table_id]);
            }
        }

        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 5. TABLE MANAGEMENT
 * GET /api/tables
 */
router.get('/tables', async (req, res) => {
    try {
        const { rows } = await pg.query('SELECT * FROM tables ORDER BY table_number ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tables', async (req, res) => {
    try {
        const { table_number } = req.body;
        const { rows } = await pg.query('INSERT INTO tables (table_number) VALUES ($1) RETURNING *', [table_number]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 6. DASHBOARD APIs
 * GET /api/v2/restaurant/dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        const revenue = await pg.query(
          "SELECT COALESCE(SUM(total_amount),0) AS total FROM orders WHERE status='completed'"
        );
    
        const orders = await pg.query(
          "SELECT COUNT(*) FROM orders WHERE DATE(created_at)=CURRENT_DATE"
        );
    
        const tables = await pg.query(
          "SELECT COUNT(*) FROM tables WHERE status!='available'"
        );
    
        const kitchen = await pg.query(
          "SELECT COUNT(*) FROM orders WHERE status IN ('pending','preparing')"
        );
    
        res.json({
          total_revenue: Number(revenue.rows[0].total),
          orders_today: Number(orders.rows[0].count),
          active_tables: Number(tables.rows[0].count),
          kitchen_queue: Number(kitchen.rows[0].count),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Dashboard error", details: err.message, stack: err.stack });
    }
});

/**
 * 6.1 SEED DATA API (Internal Diagnostic)
 */
router.get('/seed', async (req, res) => {
    try {
      await pg.query(`
        INSERT INTO tables (table_number, status)
        VALUES ('1','available'),('2','occupied'),('3','ordered'),('4','available')
        ON CONFLICT (table_number) DO NOTHING;
      `);
  
      await pg.query(`
        INSERT INTO orders (table_id, status, total_amount, gst_amount, created_at)
        VALUES
        (2,'completed',1260,60,NOW()),
        (3,'pending',840,40,NOW()),
        (4,'preparing',630,30,NOW())
        ON CONFLICT DO NOTHING;
      `);
  
      res.json({ message: "Seed data added" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Seed error", details: err.message, stack: err.stack });
    }
});

/**
 * 7. TEST API
 */
router.get('/test', (req, res) => {
    res.json({ message: "Backend working" });
});

module.exports = router;
