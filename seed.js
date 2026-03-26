async function seed() {
  const response = await fetch('http://localhost:5000/api/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bobo SaaS Flagship',
      industry: 'Restaurant',
      status: 'active',
      revenue: 25000
    })
  });
  const data = await response.json();
  console.log('✅ Seed Success:', data.name);
}

seed();
