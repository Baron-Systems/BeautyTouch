#!/bin/bash

# Beauty Touch - Self-Contained Build & Start Script
# Usage: chmod +x start.sh && ./start.sh

set -e

# Detect if we are in the parent folder (e.g. BeautyTouch)
if [ -d "medical-touch" ]; then
  cd medical-touch
fi

# Config: change this to the port you want
PORT=4356

echo "========================================"
echo "    Beauty Touch - Build & Start"
echo "========================================"
echo ""

# Step 1: Install frontend dependencies
echo "[1/4] Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "  -> node_modules found, skipping install"
fi

# Step 2: Build frontend
echo "[2/4] Building frontend..."
npm run build

# Step 3: Install server dependencies
echo "[3/4] Installing server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "  -> node_modules found, skipping install"
fi
cd ..

# Step 4: Stop any existing server on port $PORT
echo "[4/4] Stopping any existing server..."
pkill -f "server/server.js" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
for i in {1..5}; do
  if ! ss -tuln 2>/dev/null | grep -q ":$PORT "; then
    break
  fi
  echo "  -> waiting for port $PORT to be released..."
  sleep 1
done

# Step 5: Start server
echo "[5/5] Starting server..."
echo ""
echo "========================================"
echo "  App ready at: http://localhost:$PORT"
echo "  Admin login:  http://localhost:$PORT/#/admin/login"
echo "  Password:     medical2025"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd server
node server.js
