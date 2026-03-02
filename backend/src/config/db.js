import { MongoClient } from "mongodb";

const MONGO_URI =
"mongodb+srv://clintbobo54_db_user:Bobo%4012345@cluster0.jegbytg.mongodb.net/?retryWrites=true&w=majority";

let client;

export const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");

    client = new MongoClient(MONGO_URI);

    await client.connect();

    console.log("✅ MongoDB Connected Successfully");

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};
