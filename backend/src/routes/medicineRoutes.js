const express=require("express");
const fs=require("fs");

const router=express.Router();

const db=JSON.parse(
fs.readFileSync("medicineMaster.json")
);

router.get("/medicine/:barcode",(req,res)=>{

const barcode=req.params.barcode;

const medicine=db.medicines.find(
m=>m.barcode===barcode
);

if(!medicine){
return res.json({
status:"not_found"
});
}

res.json(medicine);

});

module.exports=router;