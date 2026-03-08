import { getDb } from '../../../lib/db.js';

export const get = async () => {
  try {
    const db = await getDb();
    const inventory = await db.collection('inventory').find({}).toArray();
    
    const today = new Date();
    const alerts = [];

    inventory.forEach(item => {
      const expiryDate = new Date(item.expiry);
      const diffDays = (expiryDate - today) / (1000 * 60 * 60 * 24);

      if (diffDays < 30) {
        alerts.push({
          medicine: item.medicine,
          expiry: item.expiry,
          stock: item.stock,
          message: "Expiring soon"
        });
      }

      if (item.stock < 20) {
        alerts.push({
          medicine: item.medicine,
          stock: item.stock,
          message: "Low stock reorder needed"
        });
      }
    });

    return new Response(JSON.stringify(alerts), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
