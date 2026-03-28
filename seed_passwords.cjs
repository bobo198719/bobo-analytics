/**
 * ONE-TIME PASSWORD SEEDER
 * Seeds the plain_password column for existing accounts using Chrome saved passwords.
 * Run: node seed_passwords.cjs
 */
const BASE = "http://localhost:5000";

// ✏️ Fill in the actual passwords from Chrome saved passwords manager
const knownPasswords = [
  { username: "admin@bobo.com", password: "password123" },
  { username: "admin",          password: "admin123" },
  { username: "bake",           password: "bake1234" },    // ← update if different
  { username: "groc test",      password: "groctest" },    // ← update if different
  { username: "grocery",        password: "grocery123" },  // ← update if different
  { username: "gros test",      password: "grostest" },    // ← update if different
  { username: "pharma123",      password: "pharma123" },   // ← update if different
  { username: "pharmatest",     password: "pharmatest" },  // ← update if different
  { username: "rest_admin",     password: "restadmin" },   // ← update if different
  { username: "trivia",         password: "trivia123" },   // ← update if different
];

async function seed() {
  const res = await fetch(BASE + "/api/admin/add-plain-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates: knownPasswords })
  });
  const data = await res.json();
  console.log("Result:", JSON.stringify(data, null, 2));
}

seed().catch(console.error);
