const express=require("express");

const router=express.Router();

const {checkRefillAlerts}=require("../controllers/refillController");

router.get("/refill-alerts",checkRefillAlerts);

module.exports=router;