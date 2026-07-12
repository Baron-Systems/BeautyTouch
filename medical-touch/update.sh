#!/bin/bash

# Beauty Touch - Auto Deploy Update Script
# Usage: chmod +x update.sh && ./update.sh

set -e

# Ensure script runs from the project directory
cd "$(dirname "$0")"

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
  # Kill any process running the server script or listening on port 3001
  pkill -f "server/server.js" 2>/dev/null || true
  pkill -f "node server.js" 2>/dev/null || true

  # Wait for port 3001 to be free (up to 10 seconds)
  for i in {1..10}; do
    if ! ss -tuln 2>/dev/null | grep -q ":3001 "; then
      break
    fi
    echo "  -> waiting for port 3001 to be released..."
    sleep 1
  done

  # Start the server from the project root with absolute path logging
  nohup node "$PWD/server/server.js" > app.log 2>&1 &
  echo "Server started in background (PID: $!)"

  # Quick health check
  sleep 2
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/categories 2>/dev/null | grep -q "200\|304"; then
    echo "Health check passed"
  else
    echo "Warning: health check failed, check app.log for details"
  fi
fi

echo ""
echo "App ready at: http://localhost:3001"
