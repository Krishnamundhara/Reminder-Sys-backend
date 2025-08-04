# Reminder System API Backend

This is the backend API for the Reminder System with user authentication, admin approval workflow, and reminder management features.

## Features

- User registration with email verification (OTP)
- Secure user authentication (login/logout)
- Admin user management and approval workflow
- User profile management with data validation
- Role-based access control (user/admin)
- Database migrations system
- Email notifications via SMTP
- Persistent session management

## Tech Stack

- Node.js
- Express.js
- PostgreSQL (via Neon DB)
- Express-session for authentication
- JWT for API token authentication
- Bcrypt for password hashing
- Nodemailer for email delivery
- Dotenv for environment management

## Project Structure

```
backend/
├── config/         # Configuration files
│   └── db.js       # Database configuration
├── controllers/    # Route controllers
│   ├── adminController.js
│   ├── authController.js
│   └── userController.js
├── models/         # Database models
│   └── User.js     # User model
├── routes/         # API routes
│   ├── admin.js
│   ├── auth.js
│   └── user.js
├── utils/          # Utility functions
│   ├── authMiddleware.js  # Authentication middleware
│   └── dbInit.js   # Database initialization
├── .env            # Environment variables (not in git)
├── .env.example    # Example environment variables
└── server.js       # Entry point
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update with your Neon DB credentials:
   ```
   cp .env.example .env
   ```
4. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `GET /api/auth/status` - Check authentication status
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/pending` - Check pending status
- `POST /api/auth/logout` - Logout user

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/pending-users` - Get pending users
- `POST /api/admin/approve-user/:id` - Approve a user
- `POST /api/admin/reject-user/:id` - Reject a user
- `POST /api/admin/deactivate-user/:id` - Deactivate a user
- `POST /api/admin/reactivate-user/:id` - Reactivate a user

### User
- `GET /api/user/dashboard` - User dashboard
- `GET /api/user/profile` - Get user profile
- `POST /api/user/update-profile` - Update user profile

## Default Admin User

When you first run the application, a default admin user is created:
- Username: admin
- Password: admin123
- Email: admin@example.com

Make sure to change these credentials in a production environment.
