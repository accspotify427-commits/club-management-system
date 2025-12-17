# 🚀 Quick Start Guide

Get the club management system running in **3 simple steps**!

## Step 1: Clone & Install

```bash
git clone https://github.com/accspotify427-commits/club-management-system.git
cd club-management-system
npm install
```

## Step 2: Run the Application

```bash
npm run dev
```

This starts both the backend (port 3000) and frontend (port 5173).

## Step 3: Open in Browser

Navigate to: **http://localhost:5173**

## 🔑 Login Credentials

### Owner Account (Full Control)
- **Email:** owner@club.com
- **Password:** password123

### Admin Account (Event Management)
- **Email:** admin@club.com
- **Password:** password123

### User Account (Book Events)
- **Email:** user@club.com
- **Password:** password123

## ✅ What You Can Do

### As Owner:
1. Toggle maintenance mode (Settings tab)
2. Create/edit/delete events
3. Create new admins
4. Manage all users and change roles
5. View all bookings
6. Send notifications

### As Admin:
1. Create/edit/delete events
2. Set pricing and capacity
3. View all bookings
4. Send notifications to users

### As User:
1. Browse available events
2. Book tickets for events
3. View booking history
4. Receive notifications

## 🎯 Try These Features

1. **Login as Owner** → Go to Settings → Toggle Maintenance Mode ON
2. **Logout** → Try logging in as User → See maintenance page!
3. **Login as Owner again** → Turn Maintenance OFF
4. **Login as Admin** → Create a new event with pricing
5. **Login as User** → Book tickets for the event
6. **Login as Admin** → View the booking in Bookings tab

## 🐛 Troubleshooting

**Port 3000 or 5173 already in use?**
```bash
# Kill the process
# On Mac/Linux:
lsof -ti:3000 | xargs kill
lsof -ti:5173 | xargs kill

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database issues?**
```bash
# Delete and restart (will recreate with default data)
rm club.db
npm run dev
```

**Dependencies issues?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 Mobile Testing

The UI is fully responsive! Try opening on your phone:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Open `http://YOUR_IP:5173` on your phone

## 🎉 That's It!

You now have a fully functional club management system running locally.

For detailed documentation, see [README.md](README.md)

---

**Need help?** Open an issue on GitHub!
