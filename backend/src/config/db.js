import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const adapter = new JSONFile("src/database/db.json");
const db = new Low(adapter, { analytics: [] });

export const connectDB = async () => {
  console.log("⏳ Connecting to Local JSON Database...");

  await db.read();

  db.data ||= { analytics: [] };

  await db.write();

  console.log("✅ JSON Database Connected Successfully");
};

export { db };
