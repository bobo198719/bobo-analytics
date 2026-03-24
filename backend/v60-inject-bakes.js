const mysql = require("mysql2/promise");
require("dotenv").config();

const DEFAULTS = [
    { name:'Spider-Man Theme Cake', category:'Chocolate Cakes', price:1800, description:'Premium chocolate sponge with hand-piped Spider-man web design.', image_url:'/menu-images/whatsapp-image-2026-03-13-at-10-59-57-jpeg-1773564631013.webp' },
    { name:'Classic Smiley Cake',   category:'Vanilla Cakes',   price:1200, description:'Joyful vanilla cream cake with a classic smiley face design.',    image_url:'/menu-images/ww-jpeg-1773564633537.webp' },
    { name:'Luxury Cupcake Box',    category:'Cupcakes & Muffins',        price:950,  description:'Set of 6 gourmet cupcakes with fresh berries and rich frosting.', image_url:'/menu-images/cake2-png-1773563690213.webp' },
    { name:'Doraemon Dream Cake',   category:'Fruit Cakes',     price:1500, description:'Bespoke buttercream cake featuring full Doraemon edible art.', image_url:'/menu-images/wewre-jpeg-1773564630497.webp' },
    { name:'Belgium Truffle Cake',  category:'Chocolate Cakes', price:1450, description:'Dense chocolate sponge with 70% dark Belgian chocolate and silk ganache.', image_url:'/menu-images/whatsapp-image-2026-03-13-at-10-59-51-jpeg-1773564630772.webp' },
    { name:'Biscoff Cheesecake',    category:'Cheesecakes',        price:1600, description:'Creamy Biscoff-infused cheesecake with a crunchy speculoos base.',  image_url:'/menu-images/whatsapp-image-2026-03-13-at-11-00-07-jpeg-1773564632288.webp' },
    { name:'Red Velvet Duo',        category:'Cupcakes & Muffins',        price:850,  description:'Signature red velvet sponge with rich cream cheese frosting.', image_url:'/menu-images/cake3-png-1773563690485.webp' },
    { name:'Mango Delight Cake',    category:'Fruit Cakes',     price:1350, description:'Fresh Alphonso mango chunks layered with soft vanilla sponge.', image_url:'/menu-images/whatsapp-image-2026-03-13-at-11-00-02-jpeg-1773564631780.webp' },
];

async function inject() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log("🚀 BOBO AI | MASTER CAKE INJECTION STARTING...");

    // Ensure table exists (just in case)
    await db.execute(`CREATE TABLE IF NOT EXISTS bakery_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        price INT,
        category VARCHAR(100),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    for (const cake of DEFAULTS) {
        try {
            await db.execute(
                "INSERT INTO bakery_products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
                [cake.name, cake.description, cake.price, cake.category, cake.image_url]
            );
            console.log(`✅ ${cake.name} Published Successfully.`);
        } catch (err) {
            console.log(`⏭️ ${cake.name} skipping...`);
        }
    }

    await db.end();
    console.log("🏁 INJECTION COMPLETE! Your menu is now live.");
}

inject().catch(console.error);
