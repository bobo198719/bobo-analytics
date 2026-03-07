const fs=require("fs");

exports.scanBill=(req,res)=>{

const sampleMedicines=[
{
medicine:"Paracetamol",
stock:100,
expiry:"2027-01-01"
},
{
medicine:"Metformin",
stock:50,
expiry:"2026-12-01"
}
];

res.json(sampleMedicines);

};
