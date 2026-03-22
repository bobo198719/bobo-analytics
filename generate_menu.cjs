const fs = require('fs');
const categories = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Chef Specials'];
const types = ['veg', 'non-veg'];
const adjectives = ['Truffle-Infused', 'Wood-Fired', 'Aged', 'Artisanal', 'Crispy', 'Braised'];
const proteins = ['Wagyu Beef', 'Salmon', 'Pork Belly', 'Chicken', 'Duck', 'Mushroom', 'Ribeye'];
const styles = ['Risotto', 'Medallion', 'Chop', 'Tail', 'Breast', 'Fillet', 'Skewer'];
const sides = ['with Asparagus', 'over Polenta', 'with Mash', 'in Red Wine Jus', 'with Carrots'];
const desserts = ['Lava Cake', 'Tiramisu', 'Cheesecake', 'Panna Cotta', 'Souffle'];
const bevs = ['Mojito', 'Martini', 'Margarita', 'Craft Beer', 'Aged Wine', 'Matcha'];

function r(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

let data = [];
for (let i = 0; i < 500; i++) {
    let cat = r(categories);
    let name = '';
    let type = 'veg';
    if (cat === 'Desserts') name = `${r(adjectives)} ${r(desserts)}`;
    else if (cat === 'Beverages') name = `${r(adjectives)} ${r(bevs)}`;
    else { 
        name = `${r(adjectives)} ${r(proteins)} ${r(styles)} ${r(sides)}`;
        if (/Beef|Chicken|Pork|Duck/.test(name)) type = 'non-veg';
    }
    name += ` (#${1000 + i})`;

    data.push({
        id: 1000 + i,
        name,
        category: cat,
        type,
        price: Math.floor(Math.random() * 40) * 5 + 100,
        gst_percent: 5,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
    });
}
fs.writeFileSync('src/data/restaurant_menu.json', JSON.stringify(data, null, 2));
console.log("500 menus generated at src/data/restaurant_menu.json");
