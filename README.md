# 💬 RealTime Fullstack Chat Application

## 🌐 Live Demo

![RealTime Chat App](image.png)

- **Frontend (Vercel)**: [https://realtime-fullstack-chat-app.vercel.app](https://realtime-fullstack-chat-app.vercel.app)
- **Backend (Render)**: [https://realtime-fullstack-chat-app-backend.onrender.com](https://realtime-fullstack-chat-app-backend.onrender.com)

> **Note**: The backend is hosted on Render's free tier, so the first request may take 30-60 seconds to wake up the server.

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

This is a full-stack real-time chat application that enables users to communicate instantly with each other. The application features user authentication, real-time messaging, online status indicators, profile customization, and a beautiful, responsive UI with multiple theme options.

### Why This Project?

- **Learn Modern Web Development**: Combines cutting-edge frontend and backend technologies
- **Real-Time Communication**: Implements WebSocket communication using Socket.io
- **Production Ready**: Includes proper error handling, authentication, and deployment strategies
- **Scalable Architecture**: Well-structured codebase following best practices

---

## ✨ Features

### 🔐 Authentication & Authorization

- **User Registration**: Secure signup with email validation
- **User Login**: JWT-based authentication with HTTP-only cookies
- **Protected Routes**: Middleware-based route protection
- **Password Security**: Bcrypt password hashing

### 💬 Real-Time Messaging

- **Instant Messaging**: Socket.io powered real-time communication
- **Text Messages**: Send and receive text messages instantly
- **Image Sharing**: Upload and share images via Cloudinary integration
- **Message History**: Persistent message storage with MongoDB
- **Read Receipts**: Track message read status
- **Unread Message Count**: Display unread message badges

### 👥 User Features

- **Online Status**: Real-time online/offline user indicators
- **User List**: Sidebar with all available users
- **Profile Picture**: Upload and update profile pictures
- **Last Message Preview**: See the last message from each conversation
- **User Sorting**: Users sorted by most recent conversation

### 🎨 UI/UX

- **Responsive Design**: Mobile-first, works on all devices
- **Multiple Themes**: 30+ DaisyUI theme options
- **Beautiful Animations**: Smooth transitions and loading states
- **Toast Notifications**: User-friendly feedback messages
- **Skeleton Loaders**: Enhanced loading experience
- **Modern Icons**: Lucide React icon library

### 🛠️ Technical Features

- **State Management**: Zustand for efficient global state
- **Error Handling**: Comprehensive error handling on client and server
- **Code Splitting**: Optimized bundle size
- **API Integration**: Axios-based HTTP client
- **Production Build**: Optimized for deployment

---

## 🚀 Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Zustand** - State management
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **TailwindCSS** - Utility-first CSS framework
- **DaisyUI** - TailwindCSS component library
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Cloudinary** - Image upload and storage
- **Cookie Parser** - Parse HTTP cookies
- **CORS** - Cross-Origin Resource Sharing

### Development Tools

- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run multiple commands simultaneously
- **ESLint** - Code linting
- **Dotenv** - Environment variable management

---

## 🏁 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Cloudinary Account** (for image uploads)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/RealTime-Fullstack-Chat-App.git
   cd RealTime-Fullstack-Chat-App
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables** (see below)

4. **Build the application**
   ```bash
   # From root directory
   npm run build
   ```

### Environment Variables

Create a `.env` file in the **backend** directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chat-app
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chat-app

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### How to get Cloudinary credentials:

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret

#### How to get MongoDB URI:

- **Local MongoDB**: `mongodb://localhost:27017/chat-app`
- **MongoDB Atlas**:
  1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a cluster
  3. Get connection string from "Connect" → "Connect your application"

---

## 💻 Usage

### Development Mode

Run both frontend and backend concurrently in development mode:

```bash
# From root directory
npm run dev
```

This will start:

- Backend server on `http://localhost:5001`
- Frontend dev server on `http://localhost:5173`

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

The app will be available at `http://localhost:5001`

### Available Scripts

```bash
# Root directory
npm run dev      # Run both frontend and backend in development mode
npm run build    # Build frontend for production
npm start        # Start backend in production mode

# Backend directory (backend/)
npm run dev      # Run backend with nodemon
npm start        # Run backend in production

# Frontend directory (frontend/)
npm run dev      # Run Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
RealTime-Fullstack-Chat-App/
│
├── backend/                 # Backend server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   └── message.controller.js
│   │   ├── lib/             # Utility libraries
│   │   │   ├── cloudinary.js
│   │   │   ├── db.js
│   │   │   ├── socket.js
│   │   │   └── utils.js
│   │   ├── middleware/      # Custom middleware
│   │   │   └── auth.middleware.js
│   │   ├── models/          # Mongoose models
│   │   │   ├── message.model.js
│   │   │   └── user.model.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.route.js
│   │   │   └── message.route.js
│   │   └── index.js         # Server entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/                # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── AuthImagePattern.jsx
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NoChatSelected.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── skeletons/
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── store/           # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useChatStore.js
│   │   │   └── useThemeStore.js
│   │   ├── lib/             # Utilities
│   │   │   ├── axios.js
│   │   │   └── utils.js
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── public/
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json             # Root package.json
├── LICENSE
└── README.md
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint          | Description                 | Authentication |
| ------ | ----------------- | --------------------------- | -------------- |
| POST   | `/signup`         | Register a new user         | No             |
| POST   | `/login`          | Login user                  | No             |
| POST   | `/logout`         | Logout user                 | Yes            |
| GET    | `/check`          | Check authentication status | Yes            |
| PUT    | `/update-profile` | Update user profile picture | Yes            |

### Message Routes (`/api/messages`)

| Method | Endpoint    | Description                     | Authentication |
| ------ | ----------- | ------------------------------- | -------------- |
| GET    | `/users`    | Get all users for sidebar       | Yes            |
| GET    | `/:id`      | Get messages with specific user | Yes            |
| POST   | `/send/:id` | Send message to user            | Yes            |
| POST   | `/read/:id` | Mark messages as read           | Yes            |

### WebSocket Events

**Client → Server:**

- `connection` - Establish socket connection

**Server → Client:**

- `getOnlineUsers` - Receive list of online users
- `newMessage` - Receive new message in real-time

---

## 🚀 Deployment

This application is deployed using:

### Frontend - Vercel

The React frontend is deployed on **Vercel**:

- **URL**: [https://realtime-fullstack-chat-app.vercel.app](https://realtime-fullstack-chat-app.vercel.app)
- **Auto-deployment**: Connected to GitHub for automatic deployments on push
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Backend - Render

The Express backend is deployed on **Render**:

- **URL**: [https://realtime-fullstack-chat-app-backend.onrender.com](https://realtime-fullstack-chat-app-backend.onrender.com)
- **Auto-deployment**: Connected to GitHub for automatic deployments on push
- **Environment Variables**: Set in Render dashboard
  - `NODE_ENV=production`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

> **Note**: Render's free tier may cause the backend to sleep after inactivity. The first request after sleeping takes 30-60 seconds to wake up the server.

### Database - MongoDB Atlas

MongoDB database is hosted on **MongoDB Atlas** (cloud):

- Free tier cluster
- Configured to allow connections from all IPs (0.0.0.0/0)

---

## 📝 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 👤 Contact

Your Name - [Samama Karim](https://twitter.com/yourtwitter)

Project Link: [https://github.com/SamamaKarim092/RealTime-Fullstack-Chat-App](https://github.com/SamamaKarim092/RealTime-Fullstack-Chat-App)

---

## 🙏 Acknowledgments

- [Socket.io Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Cloudinary](https://cloudinary.com/)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ by Samama

</div>
