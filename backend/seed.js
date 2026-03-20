const pg = require('./pg_db');

const seed = async () => {
    try {
        console.log("Seeding Demo Data...");
        
        // 1. Add Tables
        const tables = ['01', '02', '03', '04', '05', '06', '07', '08'];
        for (const t of tables) {
            await pg.query('INSERT INTO tables (table_number) VALUES ($1) ON CONFLICT DO NOTHING', [t]);
        }

        // 2. Add Menu Items
        const items = [
            { name: 'Paneer Tikka', category: 'Starters', type: 'veg', price: 280 },
            { name: 'Butter Chicken', category: 'Main Course', type: 'non-veg', price: 450 },
            { name: 'Fresh Lime Soda', category: 'Beverages', type: 'veg', price: 90 },
            { name: 'Gulab Jamun', category: 'Desserts', type: 'veg', price: 120 }
        ];
        for (const i of items) {
            await pg.query('INSERT INTO menu_items (name, category, type, price) VALUES ($1, $2, $3, $4)', [i.name, i.category, i.type, i.price]);
        }

        console.log("✅ Seeding Complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
