import { MongoClient } from "mongodb";

const MONGO_URI =
"mongodb+srv://clintbobo54_db_user:Bobo%4012345@cluster0.jegbytg.mongodb.net/?retryWrites=true&w=majority";

export const connectDB = async () => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};
