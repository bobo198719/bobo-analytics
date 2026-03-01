import { MongoClient } from "mongodb";

const uri =
"mongodb+srv://clintbobo54_db_user:Bobo@12345@cluster0.jegbytg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
};
