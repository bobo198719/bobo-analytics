async function test() {
  const url = 'https://bobo-analytics.vercel.app/api/v20-master-fix-relay';
  const payload = {
    table_id: "1",
    items: [{ menu_item_id: 1764, quantity: 1 }],
    special_notes: "V20 Final Test"
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("BODY:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error("ERROR:", e.message);
  }
}
test();
