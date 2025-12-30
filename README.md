# Mini User Management System

A full-stack web application for managing user accounts with role-based access control, built with Node.js/Express backend and React frontend.

## Project Overview

This User Management System provides:
- User authentication (signup, login, logout)
- Role-based access control (admin/user roles)
- User profile management
- Admin dashboard for user management
- Account activation/deactivation

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS

## Features

### Authentication
- User registration with email validation
- Password strength requirements (8+ chars, uppercase, lowercase, number)
- Secure login with JWT tokens
- Protected routes with token verification
- Last login timestamp tracking

### User Management (Admin)
- View all users with pagination
- Activate/deactivate user accounts
- Role-based access (admin-only)

### User Profile
- View and edit profile information
- Change password functionality
- Email update with duplicate check

## Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
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
FRONTEND_URL=http://localhost:3000
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

## Environment Variables

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Secret key for JWT signing | your-secret-key |
| JWT_EXPIRE | Token expiration time | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API base URL | http://localhost:5000/api |

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

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user",
      "status": "active"
    },
    "token": "jwt-token..."
  },
  "message": "User registered successfully"
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

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt-token..."
  },
  "message": "Login successful"
}
```

#### GET /api/auth/me
Get current authenticated user. (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/auth/logout
Logout user. (Protected)

### User Endpoints (Protected)

#### GET /api/user/profile
Get current user's profile.

#### PUT /api/user/profile
Update user profile.

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "newemail@example.com"
}
```

#### PUT /api/user/change-password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### Admin Endpoints (Admin Only)

#### GET /api/admin/users
Get all users with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### PUT /api/admin/users/:userId/activate
Activate a user account.

#### PUT /api/admin/users/:userId/deactivate
Deactivate a user account.

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

The test suite includes:
- User registration validation
- Login with correct/incorrect credentials
- Password hashing verification
- Protected route authentication
- Role-based access control

## Creating an Admin User

To create an admin user, you can either:

1. **Use MongoDB Compass or Atlas UI:**
   - Find the user document
   - Change the `role` field from `"user"` to `"admin"`

2. **Use MongoDB Shell:**
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication
- Role-based access control middleware
- Input validation on all endpoints
- Protected routes verification
- CORS configuration
- Environment variables for sensitive data
- Inactive user login prevention
- **Rate limiting** to prevent brute force attacks

## Rate Limiting

The API implements rate limiting to protect against abuse and brute force attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login/Signup (`/api/auth/*`) | 5 requests | 1 minute |
| Password Change | 3 requests | 1 minute |
| General API | 100 requests | 1 minute |

**Rate Limit Response (429 Too Many Requests):**
```json
{
  "success": false,
  "error": "Too many attempts. Please try again after 1 minute.",
  "statusCode": 429
}
```

Rate limit headers are included in responses:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit resets

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message description",
  "statusCode": 400
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## License

ISC
