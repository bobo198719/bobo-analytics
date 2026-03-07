const express=require("express");

const router=express.Router();

const {
getInventory,
addMedicine
}=require("../controllers/inventoryController");

router.get("/:pharmacyId",getInventory);

router.post("/add",addMedicine);

module.exports=router;
