# Referral Hub

A comprehensive referral management platform with separate client and server applications.

## Project Structure

```
refferal/
├── client/          # React frontend application
├── server/          # Node.js backend application
└── README.md        # This file
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

#### Install Client Dependencies
```bash
cd client
npm install
```

#### Install Server Dependencies
```bash
cd server
npm install
```

### Development

#### Run Client (Frontend)
```bash
cd client
npm start
```
The client will run on http://localhost:3000

#### Run Server (Backend)
```bash
cd server
npm run dev
```
The server will run on http://localhost:5000

#### Run Both Applications
You'll need two terminal windows:

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm start
```

### Production Build

#### Build Client
```bash
cd client
npm run build
```

#### Start Server in Production
```bash
cd server
npm start
```

## Technology Stack

### Client (Frontend)
- React 18
- React Router
- Tailwind CSS
- Axios
- Socket.io Client
- React Hook Form
- Lucide React Icons

### Server (Backend)
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.io
- JWT Authentication
- Bcrypt
- CORS
- Helmet (Security)

## Features

- User authentication and authorization
- Lead management system
- Real-time chat functionality
- Wallet and earnings tracking
- Admin dashboard
- Employee management
- Withdrawal system

## Environment Setup

### Client Environment
Create `.env.local` in the client directory:
```
REACT_APP_API_URL=http://localhost:5000
```

### Server Environment
Create `.env` in the server directory:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Deployment

### Client Deployment
The client can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages

### Server Deployment
The server can be deployed to:
- Railway
- Heroku
- AWS
- DigitalOcean

## Scripts

### Client Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Server Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

MIT License
