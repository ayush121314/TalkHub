# Project Setup Guide

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Backend Server
```bash
cd backend
node server.js
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Start the Frontend Application
```bash
cd frontend
npm start
```

---

## Troubleshooting

If you encounter module errors, try reinstalling dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

Then restart the application:
```bash
npm start
```

---

# TalkHub

## Features

### Authentication
- **Login and Register**: Secure authentication system.
- **OTP Verification**: Email-based OTP verification during registration.
- **Password Reset**: Secure OTP-based password reset functionality.

### Upcoming Lectures
- View all scheduled lectures.
- Register for lectures.
- View lecture details.

### Past Lectures
- Access recordings of past lectures.
- View materials and resources.

### Profile Management
- Update profile information.
- Track registered and attended lectures.

## OTP-Based Password Reset

TalkHub implements a secure, three-step password reset process:

1. **Request Reset**: Users enter their email to receive a one-time password (OTP).
2. **Verify OTP**: The user enters the OTP received via email.
3. **Reset Password**: After OTP verification, users can set a new password.

### Security Features

- OTPs expire after 5 minutes
- Email validation to ensure domain authenticity
- Separate OTP stores for registration and password reset
- Email notifications for successful password changes
- Password strength requirements

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Environment Variables
Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_for_sending_otps
EMAIL_PASS=your_email_app_password
```

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/talkhub.git
cd talkhub
```

2. Install dependencies:
```
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Start the application:
```
# Start backend (from the backend directory)
npm run start

# Start frontend (from the frontend directory)
npm run start
```

The application will be available at http://localhost:3000
