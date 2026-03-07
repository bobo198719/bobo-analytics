const express = require("express")
const multer = require("multer")
const scanBill = require("../ocrEngine")

const router = express.Router()

const upload = multer({ dest: "uploads/" })

router.post("/scan-bill", upload.single("bill"), async (req,res)=>{

const medicines = await scanBill(req.file.path)

res.json({
detected: medicines
})

})

module.exports = router