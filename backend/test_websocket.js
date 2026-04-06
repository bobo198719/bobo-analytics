const WebSocket = require('ws');

// Connect to the WebSocket Server running on port 8080 (from server.js)
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
    console.log("✅ WebSocket Client successfully connected to the Real-time Hub.");
    
    // Simulate receiving an event
    console.log("Listening for new orders...");
});

ws.on('message', function incoming(data) {
    const message = JSON.parse(data);
    console.log("🔥 INSTANT NOTIFICATION RECEIVED 🔥");
    console.log(message);
    
    // Close the connection after successful receipt
    ws.close();
    console.log("✅ WebSocket test successful.");
    process.exit(0);
});

ws.on('error', function error(err) {
    console.error("❌ WebSocket error:", err.message);
});

// Since the global.broadcastNewOrder requires the server, we can trigger it 
// by invoking a simple timeout if we had the server context, but for an external client 
// testing, we just wait to receive a broadcast.
// We will simulate the broadcast by pinging an API if we had one.
