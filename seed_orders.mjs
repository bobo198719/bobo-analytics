import axios from 'axios';

const SERVER = 'https://srv1449576.hstgr.cloud:5000/api/v2/restaurant';

async function seedOrders() {
    console.log("🚀 Starting Order Matrix Seeding...");
    
    try {
        // 1. Get Menu Items
        const menuRes = await axios.get(`${SERVER}/menu`);
        const menu = menuRes.data;
        if (!menu.length) return console.log("❌ No menu items found. Seed menu first.");

        // 2. Get Tables
        const tablesRes = await axios.get(`${SERVER}/tables`);
        const tables = tablesRes.data;
        if (!tables.length) return console.log("❌ No tables found.");

        const orders = [];
        const now = new Date();

        // 3. Create ~300 orders over 30 days
        for (let i = 0; i < 300; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const hour = Math.floor(Math.random() * 14) + 10; // 10 AM to 12 PM
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);
            date.setHours(hour, Math.floor(Math.random() * 60));

            const table = tables[Math.floor(Math.random() * tables.length)];
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const items = [];
            for (let j = 0; j < itemCount; j++) {
                const item = menu[Math.floor(Math.random() * menu.length)];
                items.push({
                    menu_item_id: item.id,
                    menu_name: item.name,
                    category: item.category,
                    price: item.price,
                    quantity: Math.floor(Math.random() * 2) + 1
                });
            }

            const total = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
            const gst = total * 0.05;

            orders.push({
                table_id: table.id,
                status: 'completed',
                total_amount: total + gst,
                gst_amount: gst,
                items: items, // Send as array, backend will JSON.stringify
                created_at: date.toISOString().slice(0, 19).replace('T', ' ')
            });
        }

        console.log(`📦 Generated ${orders.length} orders. Sending to matrix...`);
        const res = await axios.post(`${SERVER}/seed-orders`, { orders });
        console.log(`✅ Success! Seeded ${res.data.count} orders.`);

    } catch (err) {
        console.error("❌ Seeding Fail:", err.response?.data || err.message);
    }
}

seedOrders();
