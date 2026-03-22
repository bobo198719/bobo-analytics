const SERVER = 'https://srv1449576.hstgr.cloud:5000/api/v2/restaurant';

async function seedOrders() {
    console.log("🚀 Starting Order Matrix Seeding...");
    
    try {
        // 1. Get Menu Items
        const menuRes = await fetch(`${SERVER}/menu`);
        const menuArr = await menuRes.json();
        if (!menuArr.length) return console.log("❌ No menu items found. Seed menu first.");

        // 2. Get Tables
        const tablesRes = await fetch(`${SERVER}/tables`);
        const tablesArr = await tablesRes.json();
        if (!tablesArr.length) return console.log("❌ No tables found.");

        const orders = [];
        const now = new Date();

        // 3. Create ~300 orders over 30 days
        for (let i = 0; i < 300; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const hour = Math.floor(Math.random() * 14) + 10; // 10 AM to 12 PM
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);
            date.setHours(hour, Math.floor(Math.random() * 60));

            const table = tablesArr[Math.floor(Math.random() * tablesArr.length)];
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const items = [];
            for (let j = 0; j < itemCount; j++) {
                const item = menuArr[Math.floor(Math.random() * menuArr.length)];
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
                total_amount: (total + gst).toFixed(2),
                gst_amount: gst.toFixed(2),
                items: items, 
                created_at: date.toISOString().slice(0, 19).replace('T', ' ')
            });
        }

        console.log(`📦 Generated ${orders.length} orders. Sending to matrix...`);
        const res = await fetch(`${SERVER}/seed-orders`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders })
        });
        const final = await res.json();
        console.log(`✅ Success! Seeded ${final.count} orders.`);

    } catch (err) {
        console.error("❌ Seeding Fail:", err.message);
    }
}

seedOrders();
