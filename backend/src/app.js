const express=require("express");
const cors=require("cors");

const authRoutes=require("./routes/authRoutes");
const inventoryRoutes=require("./routes/inventoryRoutes");
const billRoutes=require("./routes/billRoutes");
const whatsappRoutes=require("./routes/whatsappRoutes");
const aiRoutes=require("./routes/aiRoutes");
const customerRoutes=require("./routes/customerRoutes");
const refillRoutes=require("./routes/refillRoutes");
const scanBillRoutes=require("./routes/scanBillRoutes");
const medicineRoutes=require("./routes/medicineRoutes");

const app=express();

app.use(cors());
app.use(express.json());

app.use("/api/users",authRoutes);
app.use("/api/inventory",inventoryRoutes);
app.use("/api",billRoutes);
app.use("/api/whatsapp",whatsappRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/customers",customerRoutes);
app.use("/api/refill",refillRoutes);
app.use("/api",scanBillRoutes);
app.use("/api",medicineRoutes);

app.get("/api/health",(req,res)=>{
res.json({
status:"OK",
message:"Bobo Analytics API Working 🚀"
});
});

module.exports=app;