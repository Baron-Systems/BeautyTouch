# Beauty Touch — Deployment Guide

## Quick Start (Linux Server)

```bash
# 1. Upload project files to server
# 2. Make script executable and run:
chmod +x start.sh
./start.sh
```

The app will be available at `http://localhost:3001`

## Manual Steps

```bash
# 1. Install frontend dependencies and build
cd /path/to/project
npm install
npm run build

# 2. Install server dependencies
cd server
npm install

# 3. Start server
cd ..
node server/server.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |

## Admin Access

- URL: `http://your-server-ip:3001/#/admin/login`
- Password: `medical2025`

## Files

| File | Purpose |
|------|---------|
| `start.sh` | Linux/Mac build & start script |
| `start.bat` | Windows build & start script |
| `server/db.sqlite` | SQLite database (auto-created) |
| `dist/` | Built frontend (auto-generated) |

## Database Backup

From the admin dashboard (`/admin/orders`), click **"تحميل DB"** to download a backup of `db.sqlite`.
