# Real-Time Collaborative Whiteboard

A full-stack real-time collaborative whiteboard application built with the MERN stack and Socket.io.

## Features

- **User Authentication**: Secure Register, Login, and Logout using JWT and Bcrypt.
- **Real-Time Collaboration**: Multiple users can join a room and see each other's drawings and chat messages instantly.
- **Interactive Canvas**: responsive drawing board with Pencil, Eraser, and Clear Board options.
- **Customization**: Ability to choose colors and brush sizes.
- **Room Management**: Create unique rooms or join existing ones via Room IDs.
- **Persistent Data**: Room and User data stored in MongoDB.
- **Premium UI**: Clean, modern, and responsive interface using React and custom CSS.

## Tech Stack

- **Frontend**: React (Vite), Socket.io-client, Axios, Lucide-React, React-Toastify.
- **Backend**: Node.js, Express, Socket.io, Mongoose (MongoDB).
- **Authentication**: JSON Web Tokens (JWT).

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or a remote URI)

### Backend Setup

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/whiteboard
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Development

- The backend runs on `http://localhost:5000`
- The frontend runs on `http://localhost:5173`
