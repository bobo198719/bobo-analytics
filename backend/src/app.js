const express=require("express");
const cors=require("cors");

const authRoutes=require("./routes/authRoutes");
const inventoryRoutes=require("./routes/inventoryRoutes");

const app=express();

app.use(cors());
app.use(express.json());

app.use("/api/users",authRoutes);
app.use("/api/inventory",inventoryRoutes);

module.exports=app;
