
# AgriExpense - Farmer's Crop Management System

A full-stack web application for farmers to manage crops and track expenses efficiently with MongoDB backend.

## 📁 Project Structure

```
agriexpense/
├── backend/              # Express.js + MongoDB backend
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & other middleware
│   ├── server.js        # Server entry point
│   ├── package.json
│   └── README.md
│
└── frontend/             # React + Vite frontend
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── pages/        # Page components
    │   ├── services/     # API service layer
    │   ├── App.jsx
    │   └── index.jsx
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── README.md
```

## 🚀 Quick Start

**Prerequisites:** Node.js (v16+), MongoDB

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

Backend: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:3000`

## 🌟 Features

- User Authentication (JWT)
- Crop Management (CRUD operations)
- Expense Tracking per crop
- Dashboard with overview
- Print/Export reports
- MongoDB data persistence

## 🛠️ Tech Stack

**Backend:** Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**Frontend:** React 19, Vite, React Router, Axios, TailwindCSS
