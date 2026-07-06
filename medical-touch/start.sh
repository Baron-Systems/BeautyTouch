#!/bin/bash

# Beauty Touch - Build & Start Script
# Usage: chmod +x start.sh && ./start.sh

set -e

echo "========================================"
echo "    Beauty Touch - Build & Start"
echo "========================================"
echo ""

# Step 1: Install frontend dependencies and build
echo "[1/3] Installing frontend dependencies..."
npm install

echo "[1/3] Building frontend..."
npm run build

# Step 2: Install server dependencies
echo "[2/3] Installing server dependencies..."
cd server
npm install
cd ..

# Step 3: Start server
echo "[3/3] Starting server..."
echo ""
echo "========================================"
echo "  App ready at: http://localhost:3001"
echo "  Admin login:  http://localhost:3001/#/admin/login"
echo "  Password:     medical2025"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd server
node server.js
