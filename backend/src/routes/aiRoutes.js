const express=require("express");

const router=express.Router();

const {expiryPrediction}=require("../controllers/aiController");

router.get("/expiry-alerts",expiryPrediction);

module.exports=router;
