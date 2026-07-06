#!/bin/bash

# Beauty Touch - Auto Deploy Update Script
# Usage: chmod +x update.sh && ./update.sh

set -e

echo "========================================"
echo "    Beauty Touch - Auto Deploy"
echo "========================================"
echo ""

# Step 1: Pull latest changes
echo "[1/4] Pulling latest changes from GitHub..."
git pull origin main

# Step 2: Install frontend dependencies (if changed)
echo "[2/4] Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "  -> node_modules found"
fi

# Step 3: Build frontend
echo "[3/4] Building frontend..."
npm run build

# Step 4: Install server dependencies
echo "[4/4] Installing server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "  -> node_modules found"
fi
cd ..

echo ""
echo "========================================"
echo "  Update complete!"
echo "========================================"
echo ""

# Restart with pm2 if available, otherwise kill node and start fresh
if command -v pm2 &> /dev/null; then
  echo "Restarting with pm2..."
  pm2 restart beauty-touch 2>/dev/null || pm2 start server/server.js --name beauty-touch
  pm2 save
  echo "App restarted with pm2"
else
  echo "Restarting server..."
  pkill -f "node server.js" 2>/dev/null || true
  nohup node server/server.js > app.log 2>&1 &
  echo "Server started in background (PID: $!)"
fi

echo ""
echo "App ready at: http://localhost:3001"
