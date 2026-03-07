const express=require("express");

const router=express.Router();

const {
loginUser,
createPharmacy
}=require("../controllers/authController");

router.post("/login",loginUser);

router.post("/create-pharmacy",createPharmacy);

module.exports=router;
