// Uses the Vercel API proxy instead of direct VPS connection
const PROXY = "https://bobo-analytics.vercel.app/api/menu";

async function hardReset() {
  let allItems = [];
  try {
    console.log("Fetching via Vercel proxy...");
    const r = await fetch(PROXY);
    if (!r.ok) { console.error("Fetch failed:", r.status, await r.text()); return; }
    allItems = await r.json();
  } catch (e) { console.error("Fetch error:", e.message); return; }
  
  console.log("Total to delete:", allItems.length);
  
  // Parallel batches of 10
  const BATCH = 10;
  for (let i = 0; i < allItems.length; i += BATCH) {
    const batch = allItems.slice(i, i + BATCH);
    await Promise.all(batch.map(it => 
      fetch(PROXY + "/" + it.id, { method: "DELETE" }).catch(() => {})
    ));
    process.stdout.write(`\rDeleted ${Math.min(i + BATCH, allItems.length)}/${allItems.length}  `);
    await new Promise(r => setTimeout(r, 100));
  }
  
  await new Promise(r => setTimeout(r, 1000));
  const remaining = await (await fetch(PROXY)).json();
  console.log("\nRemaining after delete:", remaining.length);
}

hardReset().catch(console.error);
