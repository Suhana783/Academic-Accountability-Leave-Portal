# Advanced Test-Based Leave Management System

A comprehensive MERN (MongoDB, Express.js, React.js, Node.js) stack application for managing academic leave and accountability in educational institutions.

## Project Structure

```
Academic-Accountability-Leave-Portal/
├── client/                          # Frontend (React.js)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API service calls
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── context/                 # Global state management
│   │   ├── assets/                  # Images, fonts, media
│   │   ├── styles/                  # CSS/SCSS files
│   │   ├── utils/                   # Utility functions
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
│
├── server/                          # Backend (Node.js + Express.js)
│   ├── src/
│   │   ├── config/                  # Database & environment config
│   │   ├── models/                  # MongoDB schemas
│   │   ├── controllers/             # Request handlers
│   │   ├── routes/                  # API routes
│   │   ├── middleware/              # Auth, validation, error handling
│   │   ├── services/                # Business logic
│   │   ├── utils/                   # Helper functions
│   │   └── server.js                # App entry point
│   ├── tests/                       # Unit & integration tests
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── .gitignore
└── README.md
```

## Tech Stack

- **Frontend**: React.js, Vite, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT
- **Styling**: CSS/SCSS, Tailwind CSS (optional)

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

**Client Setup**
```bash
cd client
npm install
npm run dev
```

**Server Setup**
```bash
cd server
npm install
npm run dev
```

## Environment Variables

See `.env.example` files in both `client/` and `server/` directories.

## Documentation

- [Client Docs](./client/README.md)
- [Server Docs](./server/README.md)