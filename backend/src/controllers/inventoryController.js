const fs=require("fs");
const path=require("path");

const dbPath=path.join(__dirname,"../database/db.json");

exports.getInventory=(req,res)=>{

const {pharmacyId}=req.params;

const db=JSON.parse(fs.readFileSync(dbPath));

const inventory=db.inventory.filter(
i=>i.pharmacyId===pharmacyId
);

res.json(inventory);

};

exports.addMedicine=(req,res)=>{

const {pharmacyId,medicine,stock,expiry}=req.body;

const db=JSON.parse(fs.readFileSync(dbPath));

const newItem={
pharmacyId,
medicine,
stock,
expiry
};

db.inventory.push(newItem);

fs.writeFileSync(dbPath,JSON.stringify(db,null,2));

res.json({
message:"Medicine added",
item:newItem
});

};
