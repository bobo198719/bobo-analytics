const fs=require("fs");
const path=require("path");

const dbPath=path.join(__dirname,"../database/db.json");

exports.loginUser=(req,res)=>{

const {pharmacyId,password}=req.body;

const db=JSON.parse(fs.readFileSync(dbPath));

const user=db.pharmacies.find(
p=>p.pharmacyId===pharmacyId && p.password===password
);

if(!user){

return res.status(401).json({
error:"Invalid login"
});

}

res.json({
message:"Login successful",
pharmacy:user.pharmacy
});

};

exports.createPharmacy=(req,res)=>{

const {pharmacy,pharmacyId,password}=req.body;

const db=JSON.parse(fs.readFileSync(dbPath));

const newPharmacy={
id:Date.now(),
pharmacy,
pharmacyId,
password,
plan:"999",
status:"active"
};

db.pharmacies.push(newPharmacy);

fs.writeFileSync(dbPath,JSON.stringify(db,null,2));

res.json({
message:"Pharmacy created",
pharmacy:newPharmacy
});

};
