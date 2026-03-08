import { getDb } from '../../../lib/db.js';

export const post = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, password, industry, role = 'user' } = body;

    // Simple auth check for admin (in a real app, verify JWT token from request)
    // For now, we assume this is called from the admin dashboard which is protected by frontend logic
    // or we could check a specific header/cookie.

    if (!username || !password || !industry) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const db = await getDb();
    
    // Check if user already exists
    const existing = await db.collection('users').findOne({ username });
    if (existing) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      username,
      password, // In production, hash this with bcrypt
      industry,
      role
    };

    await db.collection('users').insertOne(newUser);

    return new Response(JSON.stringify({ message: "User created", user: { username, industry } }), { status: 201 });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
};
