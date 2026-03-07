const express=require("express");
const fs=require("fs");
const path=require("path");

const router=express.Router();

const dbPath=path.join(__dirname,"../database/db.json");

router.post("/send-bill",(req,res)=>{

const {pharmacyId,customerPhone,items,total}=req.body;

const db=JSON.parse(fs.readFileSync(dbPath));

const pharmacy=db.pharmacies.find(
p=>p.pharmacyId===pharmacyId
);

if(!pharmacy){

return res.status(404).json({
error:"Pharmacy not found"
});

}

let billText=`${pharmacy.pharmacy}
Phone: ${pharmacy.phone}

Invoice

`;

items.forEach(item=>{
billText+=`${item.name} x${item.qty} ₹${item.price}\n`;
});

billText+=`
Total: ₹${total}

Thank you for visiting ${pharmacy.pharmacy}
Powered by Bobo Analytics`;

console.log("Sending WhatsApp bill to:",customerPhone);

console.log(billText);

res.json({
status:"Bill sent",
message:billText
});

});

module.exports=router;
