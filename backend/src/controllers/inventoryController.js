const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../database/db.json");

exports.getInventory = (req, res) => {

const pharmacyId = req.query.pharmacyId;

const db = JSON.parse(fs.readFileSync(dbPath));

const inventory = db.inventory.filter(
item => item.pharmacyId === pharmacyId
);

res.json(inventory);

};

exports.addMedicine = (req, res) => {

const { pharmacyId, medicine, stock, expiry } = req.body;

const db = JSON.parse(fs.readFileSync(dbPath));

const newMedicine = {
pharmacyId,
medicine,
stock,
expiry
};

db.inventory.push(newMedicine);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

res.json({
message: "Medicine added successfully",
medicine: newMedicine
});

};
