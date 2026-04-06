const express = require('express');
const router = require('./routes/restaurant_v2');
const app = express();

app.use(express.json());
app.use('/', router);

const request = require('http');

app.listen(12345, async () => {
    console.log("Mock server on 12345");
    const fetch = (await import('node-fetch')).default;
    try {
        const res = await fetch('http://localhost:12345/dashboard');
        const text = await res.text();
        console.log("RESPONSE:", text);
    } catch(e) {
        console.log("ERR:", e);
    }
    process.exit(0);
});
