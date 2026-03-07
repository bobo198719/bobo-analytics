const express = require("express");
const router = express.Router();

const { 
getInventory,
addMedicine
} = require("../controllers/inventoryController");

router.get("/", getInventory);

router.post("/", addMedicine);

module.exports = router;
