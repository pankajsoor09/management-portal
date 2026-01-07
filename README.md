#User Management System

A full-stack web application for managing user accounts with role-based access(superadmin/admin/user) control, built with Node.js/Express backend and React frontend.

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://management-portal-three.vercel.app |
| **Backend API** | https://management-portal-np7g.onrender.com |
| **API Documentation** | https://.postman.co/workspace/My-Workspace~1b0efec0-6595-4c86-84ac-06503e152580/request/45354103-7062f0b8-d532-4944-9375-2aac59815a11?action=share&creator=45354103&ctx=documentation&active-environment=45354103-69dea497-50c8-453b-b09b-5861178baf72 |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | pankajsoor09@gmail.com | Abcd@#$54321 |
| **Admin** | pankajsoor092@gmail.com | Abcd@1234 |

> **Note:** Backend may take 30-50 seconds to wake up on first request (Render free tier limitation).

## Project Overview

This User Management System provides:
- User authentication (signup, login, logout)
- Role-based access control (superadmin/admin/user roles)
- User profile management
- Admin dashboard for user management
- Account activation/deactivation
- User search functionality
- Permanent user deletion (superadmin only)

## Role Hierarchy

| Role | Permissions |
|------|-------------|
| **Super Admin** | View all users, activate/deactivate admins & users, delete users permanently, cannot be deactivated |
| **Admin** | View admins & users (not superadmins), activate/deactivate users only |
| **User** | View and edit own profile, change password |

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS

## Features

### Authentication
- User registration with email validation
- Password strength requirements (8+ chars, uppercase, lowercase, number)
- Password strength indicator with real-time feedback
- Secure login with JWT tokens
- Protected routes with token verification
- Last login timestamp tracking
- Inactive user login prevention with clear error message

### User Management (Admin/Super Admin)
- View all users with pagination
- Search users by name or email
- Activate/deactivate user accounts
- Delete users permanently (superadmin only)
- Role-based permissions
- Confirmation modals for all actions

### User Profile
- View and edit profile information
- Change password with validation
- Email update with duplicate check

## Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Express server entry
│   ├── tests/              # Jest unit tests
│   ├── package.json
│   └── .env.example
├── README.md
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js v16 or higher
- npm v8 or higher
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/user-management
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
```

5. Start the server:
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Deployment

### MongoDB Atlas
1. Create free M0 cluster
2. Add `0.0.0.0/0` to Network Access
3. Get connection string

### Render (Backend)
1. Create Web Service
2. Set Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables

### Vercel (Frontend)
1. Import GitHub repo
2. Set Root Directory: `frontend`
3. Add `REACT_APP_API_URL` environment variable

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "fullName": "John Doe"
}
```

#### POST /api/auth/login
Authenticate user and get token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### GET /api/auth/me
Get current authenticated user. (Protected)

#### POST /api/auth/logout
Logout user. (Protected)

### User Endpoints (Protected)

#### GET /api/user/profile
Get current user's profile.

#### PUT /api/user/profile
Update user profile.

#### PUT /api/user/change-password
Change user password.

### Admin Endpoints (Admin/Super Admin Only)

#### GET /api/admin/users
Get all users with pagination and search.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional) - search by name or email

#### PUT /api/admin/users/:userId/activate
Activate a user account.

#### PUT /api/admin/users/:userId/deactivate
Deactivate a user account.

#### DELETE /api/admin/users/:userId
Permanently delete a user. (Super Admin only)

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication
- Role-based access control middleware
- Input validation on all endpoints
- Protected routes verification
- CORS configuration
- Environment variables for sensitive data
- Inactive user login prevention
- Rate limiting to prevent brute force attacks

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login/Signup (`/api/auth/*`) | 5 requests | 1 minute |
| Password Change | 3 requests | 1 minute |
| General API | 100 requests | 1 minute |

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Creating Admin/Super Admin Users

1. **Using MongoDB Atlas UI:**
   - Find the user document in the `users` collection
   - Change the `role` field to `"admin"` or `"superadmin"`

2. **Using MongoDB Shell:**
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)

db.users.updateOne(
  { email: "superadmin@example.com" },
  { $set: { role: "superadmin" } }
)
```

## Testing

```bash
cd backend
npm test
```
