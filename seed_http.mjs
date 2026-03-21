const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
const types = ['veg', 'non-veg'];

const adjectives = [
    'Truffle-Infused', 'Wood-Fired', 'Aged', 'Artisanal', 'Crispy', 'Braised', 
    'Pan-Seared', 'Aromatic', 'Wild-Caught', 'Charred', 'Honey-Glazed', 'Smoked', 
    'Herb-Crusted', 'Spicy', 'Zesty', 'Slow-Cooked', 'Hickory', 'Garlic-Butter'
];

const proteins = [
    'Wagyu Beef', 'Salmon', 'Pork Belly', 'Chicken', 'Duck', 'Mushroom', 
    'Ribeye', 'Lobster', 'Prawns', 'Tofu', 'Lamb', 'Scallop', 'Crab',
    'Tuna', 'Venison', 'Halibut', 'Brisket'
];

const styles = [
    'Risotto', 'Medallion', 'Chop', 'Tail', 'Breast', 'Fillet', 'Skewer',
    'Pasta', 'Bowl', 'Tartare', 'Carpaccio'
];

const sides = [
    'with Asparagus', 'over Polenta', 'with Garlic Mash', 'in Red Wine Jus', 
    'with Heirloom Carrots', 'and Caviar', 'with Saffron Puree', 'in Citrus Reduction', 
    'with Caramelized Onions', 'with Quinoa', 'in Truffle Cream', 'on a bed of Greens'
];

const desserts = [
    'Lava Cake', 'Tiramisu', 'Cheesecake', 'Panna Cotta', 'Creme Brulee', 
    'Gelato', 'Macarons', 'Tart', 'Souffle', 'Fondant'
];
const dessertStyles = ['with Raspberry Coulis', 'with Gold Leaf', 'in Dark Chocolate', 'with Vanilla Bean', 'and Pistachio'];

const beverages = [
    'Mojito', 'Martini', 'Margarita', 'Old Fashioned', 'Negroni', 
    'Craft Beer', 'Aged Wine', 'Artisan Gin', 'Espresso', 'Matcha Latte'
];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDish(i) {
    let category = getRandom(categories);
    let type = getRandom(types);
    let name = '';
    
    if (category === 'Desserts') {
        name = `${getRandom(adjectives)} ${getRandom(desserts)} ${getRandom(dessertStyles)}`;
        type = 'veg';
    } else if (category === 'Beverages') {
        name = `${getRandom(adjectives)} ${getRandom(beverages)}`;
        type = 'veg';
    } else {
        name = `${getRandom(adjectives)} ${getRandom(proteins)} ${getRandom(styles)} ${getRandom(sides)}`;
        if (name.includes('Beef') || name.includes('Chicken') || name.includes('Pork') || name.includes('Duck') || name.includes('Lamb')) {
            type = 'non-veg';
        }
    }

    // append a unique ID to prevent purely identical names, or just rely on randomness
    name = name + ` (#${1000 + i})`;

    return {
        name,
        category,
        type,
        price: Math.floor(Math.random() * 40) * 5 + 100, // Price between 100 and 300
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
    };
}

async function run() {
    const total = 500;
    const batchSize = 10;
    const url = 'http://srv1449576.hstgr.cloud:5000/api/v2/restaurant/menu';
    
    console.log(`Generating and uploading ${total} premium dishes...`);
    
    for (let i = 0; i < total; i += batchSize) {
        const batch = [];
        for (let j = 0; j < batchSize; j++) {
            if (i + j < total) batch.push(generateDish(i + j));
        }

        await Promise.all(batch.map(async (dish) => {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dish)
                });
                if (!res.ok) {
                    console.error("Failed to insert:", dish.name, "Status:", res.status);
                }
            } catch(e) {
                console.error("Error inserting:", dish.name, e.message);
            }
        }));
        
        console.log(`Inserted ${Math.min(i + batchSize, total)} / ${total}`);
    }
    console.log("Done seeding items.");
}

run();
