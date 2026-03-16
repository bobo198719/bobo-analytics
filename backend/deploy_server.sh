#!/bin/bash
# Script to be run on Hostinger VPS

cd /root/bobo-analytics/backend/

echo "📦 Extracting new backend..."
tar -xzf backend_update.zip
rm backend_update.zip 

echo "⚙️ Installing dependencies..."
npm install

echo "🗄️ Running Database Migration..."
node migrate.js

echo "🔄 Restarting Backend via PM2..."
# Stop and delete any existing processes for a fresh start
pm2 delete all || true

# Start the new backend
pm2 start server.js --name bobo-backend --watch

echo "✨ Backend updated successfully!"
rm backend_update.zip
rm migrate.js # Cleanup migration script after run
