const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../database/db.json");

exports.loginUser = (req, res) => {

const { pharmacyId, password } = req.body;

const db = JSON.parse(fs.readFileSync(dbPath));

const user = db.pharmacies.find(
p => p.pharmacyId === pharmacyId && p.password === password
);

if(!user){
return res.status(401).json({
error: "Invalid login"
});
}

res.json({
message: "Login successful",
pharmacy: user.pharmacy
});

};
