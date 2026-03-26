async function register() {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bobo.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('✅ Admin User Registered:', data.message);
  } catch (err) {
    console.error('❌ Registration Failure (Backend might be down):', err.message);
  }
}

register();
