import { connectToDatabase } from '../../../lib/mongoose.js';
import mongoose from 'mongoose';

export const prerender = false;
export const GET = async () => {
  try {
    await connectToDatabase();
    // Assuming inventory is a collection we want to check
    // We can use native driver via mongoose.connection.db or define a model
    const db = mongoose.connection.db;
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

    return new Response(JSON.stringify(alerts), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("Expiry Alert Error:", err);
    return new Response(JSON.stringify({ error: "Server error", details: err.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
};
