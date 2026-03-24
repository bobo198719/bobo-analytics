const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/diag-files", async (req, res) => {
    const folders = [
        "/var/www/storage/bakery/images",
        "/var/www/storage/menu-images",
        path.join(__dirname, "..", "public", "menu-images"),
        path.join(__dirname, "..", "uploads")
    ];
    
    const status = {};
    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            const files = fs.readdirSync(folder).slice(0, 10);
            status[folder] = { exists: true, count: fs.readdirSync(folder).length, sample: files };
        } else {
            status[folder] = { exists: false };
        }
    }
    res.json(status);
});

module.exports = router;
