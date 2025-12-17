# 🎉 Elite Club Management System

A full-stack club management website with role-based access control, event management, booking system, and real-time notifications.

## ✨ Features

### 🔐 Three User Roles

**👑 Owner**
- Full system control
- Toggle maintenance mode (blocks users & admins)
- Customize club name and description
- Create and manage admins
- Manage all events and bookings
- Change user roles
- Delete users
- Send notifications to all users

**⚡ Admin**
- Create, edit, and delete events
- Set event pricing and capacity
- View all bookings and payments
- Send in-app notifications to users
- Access dashboard statistics

**👤 User**
- View all available events with pricing
- Book events with ticket selection
- View personal booking history
- Receive in-app notifications
- Blocked during maintenance mode

### 🎯 Core Features

- ✅ **Working Login & Registration** - JWT-based authentication
- ✅ **Role-Based Access Control** - Different dashboards for each role
- ✅ **Persistent Data** - SQLite database with automatic initialization
- ✅ **Event Management** - Full CRUD operations for events
- ✅ **Booking System** - Real-time capacity tracking
- ✅ **Payment Tracking** - Dummy payment status (easily extendable)
- ✅ **Notifications** - In-app notification system
- ✅ **Maintenance Mode** - Owner can block user/admin access
- ✅ **Responsive UI** - Beautiful gradient design, mobile-friendly
- ✅ **Real-time Updates** - Instant UI updates after actions

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/accspotify427-commits/club-management-system.git
cd club-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` if needed (default values work fine for development):
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. **Run the application**
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5173`

5. **Open your browser**

Navigate to `http://localhost:5173`

## 🔑 Test Accounts

The system comes with pre-configured test accounts:

| Role | Email | Password |
|------|-------|----------|
| **Owner** | owner@club.com | password123 |
| **Admin** | admin@club.com | password123 |
| **User** | user@club.com | password123 |

## 📁 Project Structure

```
club-management-system/
├── server/                 # Backend (Express.js)
│   ├── index.js           # Server entry point
│   ├── database.js        # SQLite database setup
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   └── routes/
│       ├── auth.js        # Login/register routes
│       ├── events.js      # Event routes
│       ├── bookings.js    # Booking routes
│       ├── admin.js       # Admin-only routes
│       ├── owner.js       # Owner-only routes
│       └── notifications.js # Notification routes
├── src/                   # Frontend (Vanilla JS)
│   ├── main.js           # App router
│   ├── auth.js           # Auth utilities
│   ├── api.js            # API client
│   ├── style.css         # Styles
│   └── pages/
│       ├── auth.js       # Login/register pages
│       ├── user.js       # User dashboard
│       ├── admin.js      # Admin dashboard
│       ├── owner.js      # Owner dashboard
│       └── maintenance.js # Maintenance page
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🎨 Tech Stack

**Frontend:**
- Vanilla JavaScript (ES6+)
- Vite (build tool)
- CSS3 (custom styling, no frameworks)

**Backend:**
- Node.js
- Express.js
- Better-SQLite3 (database)
- JWT (authentication)
- bcryptjs (password hashing)

## 📖 Usage Guide

### As Owner

1. Login with owner credentials
2. **Settings Tab**: Toggle maintenance mode, customize club info
3. **Events Tab**: Create/edit/delete events
4. **Bookings Tab**: View all bookings across all users
5. **Users Tab**: Manage users, create admins, change roles
6. **Notifications Tab**: Send broadcast messages

### As Admin

1. Login with admin credentials
2. **Events Tab**: Create/edit/delete events with pricing
3. **Bookings Tab**: View all user bookings
4. **Notifications Tab**: Send messages to all users
5. View dashboard statistics

### As User

1. Login or register a new account
2. **Events Tab**: Browse available events
3. Click "Book Now" to purchase tickets
4. **My Bookings Tab**: View your booking history
5. **Notifications Tab**: Check messages from admins

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings

### Admin (requires admin/owner role)
- `POST /admin/events` - Create event
- `PUT /admin/events/:id` - Update event
- `DELETE /admin/events/:id` - Delete event
- `GET /admin/bookings` - Get all bookings
- `GET /admin/stats` - Get statistics
- `POST /admin/notifications/broadcast` - Send notification

### Owner (requires owner role)
- `GET /owner/settings` - Get settings
- `PUT /owner/settings/:key` - Update setting
- `POST /owner/maintenance` - Toggle maintenance mode
- `GET /owner/users` - Get all users
- `POST /owner/admins` - Create admin
- `PUT /owner/users/:id/role` - Update user role
- `DELETE /owner/users/:id` - Delete user

## 🎯 Key Features Explained

### Maintenance Mode
When enabled by the owner:
- Users and admins see a maintenance page
- Owner retains full access
- All API calls from non-owners return 503 status
- Automatically checked on every protected route

### Role-Based Access
- Middleware validates JWT tokens
- Routes protected by role requirements
- Frontend shows different dashboards per role
- Unauthorized access attempts are blocked

### Booking System
- Real-time capacity tracking
- Prevents overbooking
- Automatic price calculation
- Instant notification on successful booking

### Notification System
- Admins/owners can broadcast messages
- Users receive notifications in-app
- Unread count displayed
- Mark as read functionality

## 🚢 Deployment

### Option 1: Traditional Hosting

1. Build the frontend:
```bash
npm run build
```

2. Serve the `dist` folder and run the backend:
```bash
npm run server
```

### Option 2: Platform-Specific

**Heroku:**
```bash
heroku create your-app-name
git push heroku main
```

**Railway:**
- Connect your GitHub repo
- Set build command: `npm install`
- Set start command: `npm run server`

**Vercel/Netlify:**
- Deploy frontend from `dist` folder
- Deploy backend separately or use serverless functions

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Implement rate limiting for production
- Add input validation and sanitization
- Use environment variables for sensitive data

## 📝 Database Schema

**users**
- id, email, password (hashed), name, role, created_at

**events**
- id, title, description, date, time, price, capacity, booked, image_url, created_by, created_at

**bookings**
- id, user_id, event_id, tickets, total_price, payment_status, booking_date

**notifications**
- id, user_id, message, type, read, created_at

**settings**
- key, value (maintenance_mode, club_name, club_description)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🎉 Demo

**Live Demo:** [Coming Soon]

**Screenshots:**

- Login page with test credentials
- User dashboard with event browsing
- Admin dashboard with event management
- Owner dashboard with full control
- Maintenance mode page

## 💡 Future Enhancements

- [ ] Real payment gateway integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] Event categories and filtering
- [ ] User profile management
- [ ] Event images upload
- [ ] Advanced analytics dashboard
- [ ] Export bookings to CSV
- [ ] Multi-language support
- [ ] Dark mode

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3001
```

**Database locked:**
```bash
# Delete club.db and restart
rm club.db
npm run dev
```

**Module not found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions

---

**Built with ❤️ for club management**
