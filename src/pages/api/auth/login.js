import { getDb } from '../../../lib/db.js';
import jwt from 'jsonwebtoken';

export const post = async ({ request }) => {
  try {
    const body = await request.json();
    const { pharmacyId, username, password, industry } = body;

    const db = await getDb();

    // 1. Check for legacy pharmacy login (if pharmacyId is provided)
    if (pharmacyId) {
      const pharmacy = await db.collection('pharmacies').findOne({ pharmacyId, password });
      if (pharmacy) {
        const token = jwt.sign({ id: pharmacy.id, type: 'pharmacy', industry: 'pharmacy' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        return new Response(JSON.stringify({ 
          message: "Login successful", 
          pharmacy: pharmacy.pharmacy,
          token 
        }), { status: 200 });
      }
    }

    // 2. Check for industry-specific user login
    const user = await db.collection('users').findOne({ username, password });
    if (user) {
      // Validate industry if specified (e.g., logging in from a specific solution page)
      if (industry && user.industry !== industry && user.industry !== 'all') {
        return new Response(JSON.stringify({ error: `Not authorized for ${industry}` }), { status: 403 });
      }

      const token = jwt.sign({ id: user.id, type: 'user', industry: user.industry }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
      return new Response(JSON.stringify({ 
        message: "Login successful", 
        username: user.username,
        industry: user.industry,
        token 
      }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
