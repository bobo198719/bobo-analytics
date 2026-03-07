const fs=require("fs");
const path=require("path");

const dbPath=path.join(__dirname,"../database/db.json");

exports.expiryPrediction=(req,res)=>{

const db=JSON.parse(fs.readFileSync(dbPath));

const today=new Date();

const alerts=[];

db.inventory.forEach(item=>{

const expiryDate=new Date(item.expiry);

const diffDays=(expiryDate-today)/(1000*60*60*24);

if(diffDays<30){

alerts.push({
medicine:item.medicine,
expiry:item.expiry,
stock:item.stock,
message:"Expiring soon"
});

}

if(item.stock<20){

alerts.push({
medicine:item.medicine,
stock:item.stock,
message:"Low stock reorder needed"
});

}

});

res.json(alerts);

};
