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
