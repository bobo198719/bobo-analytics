import { MongoClient } from "mongodb";

const MONGO_URI =
  "PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE";

let client;

export const connectDB = async () => {
  try {
    client = new MongoClient(MONGO_URI);

    await client.connect();

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};
