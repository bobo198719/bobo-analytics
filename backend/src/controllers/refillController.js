const fs=require("fs");
const path=require("path");

const dbPath=path.join(__dirname,"../database/db.json");

exports.checkRefillAlerts=(req,res)=>{

const db=JSON.parse(fs.readFileSync(dbPath));

const alerts=[];

db.customers.forEach(c=>{

if(c.totalPurchases>0){

alerts.push({
name:c.name,
phone:c.phone,
medicine:"Metformin",
message:"Your refill is due"
});

}

});

res.json(alerts);

};