import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb://127.0.0.1:27017";

let client;

export const connectDB = async () => {
  try {
    console.log("⏳ Connecting to Local MongoDB...");

    client = new MongoClient(MONGO_URI);

    await client.connect();

    console.log("✅ Local MongoDB Connected Successfully");

  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};
