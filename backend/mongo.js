const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected for Trivia Portal"))
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit if cannot connect to cloud database
});

module.exports = mongoose;
