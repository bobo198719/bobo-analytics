const vision = require("@google-cloud/vision")
const Tesseract = require("tesseract.js")

const client = new vision.ImageAnnotatorClient({
keyFilename: "google-vision-key.json"
})

async function googleOCR(imagePath){

try{

const [result] = await client.textDetection(imagePath)

const detections = result.textAnnotations

if(!detections.length) return null

return detections[0].description

}catch(e){

return null

}

}

async function tesseractOCR(imagePath){

const result = await Tesseract.recognize(imagePath,"eng")

return result.data.text

}

async function scanBill(imagePath){

let text = await googleOCR(imagePath)

if(!text){

console.log("Google OCR failed, using Tesseract")

text = await tesseractOCR(imagePath)

}

const lines = text.split("\n")

const medicines = []

lines.forEach(line => {

if(line.match(/[A-Za-z]/)){
medicines.push(line)
}

})

return medicines

}

module.exports = scanBill