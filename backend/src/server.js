import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();

/* =====================
   MIDDLEWARE
===================== */
app.use(cors());
app.use(express.json());

/* =====================
   MONGODB CONNECTION
===================== */

// IMPORTANT: @ must be encoded as %40
const MONGO_URI =
"mongodb+srv://clintbobo54_db_user:Bobo%4012345@cluster0.jegbytg.mongodb.net/?retryWrites=true&w=majority";

async function startServer() {
  try {
    console.log("⏳ Connecting to MongoDB...");

    const client = new MongoClient(MONGO_URI);

    await client.connect();

    console.log("✅ MongoDB Connected Successfully");

    /* =====================
       ROUTES
    ===================== */
    app.get("/", (req, res) => {
      res.send("Bobo Analytics Backend Running 🚀");
    });

    app.get("/api/health", (req, res) => {
      res.json({ status: "OK" });
    });

    /* =====================
       START SERVER
    ===================== */
    const PORT = 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error);
  }
}

startServer();
