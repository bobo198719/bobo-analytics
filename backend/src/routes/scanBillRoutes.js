const express=require("express");
const multer=require("multer");
const scanBill=require("../ocrEngine");

const router=express.Router();

const upload=multer({
dest:"uploads/"
});

router.post("/scan-bill",upload.single("bill"),async(req,res)=>{

try{

const medicines=await scanBill(req.file.path);

res.json({
status:"success",
detected:medicines
});

}catch(error){

console.error(error);

res.status(500).json({
status:"error",
message:"Bill scanning failed"
});

}

});

module.exports=router;