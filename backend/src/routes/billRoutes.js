const express=require("express");

const router=express.Router();

const {scanBill}=require("../controllers/billController");

router.post("/bill-scan",scanBill);

module.exports=router;
