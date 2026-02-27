# 📡 CONNECT — Complete Project Explanation for Viva

## 📌 What is this project?
**CONNECT** (also known as AuraBoard) is a high-performance **Real-Time Collaborative Whiteboard** and **Video Conferencing** application. It is built using the full **MERN** stack:

*   **M → MongoDB**: Stores user profiles and room metadata.
*   **E → Express.js**: Handles API routing and server-side logic.
*   **R → React.js**: Drives the interactive, single-page frontend.
*   **N → Node.js**: The high-speed runtime for the backend server.
*   **Collaboration**: **Socket.io** for real-time synchronization and **WebRTC** for peer-to-peer video/screen sharing.

---

## 🏗️ Project Folder Structure
```text
caps/
├── client/                 ← Frontend (React/Vite)
│   ├── src/
│   │   ├── components/     ← Reusable UI (Chat, Whiteboard, Toolbar)
│   │   ├── context/        ← Global State (Auth, Theme)
│   │   ├── hooks/          ← Custom Logic (useSocket)
│   │   ├── pages/          ← Full Screen views (Home, Room, Login)
│   │   └── main.jsx        ← React entry point
│   ├── .env                ← Frontend API keys
│   └── index.html          ← HTML shell
└── server/                 ← Backend (Node/Express)
    ├── models/             ← DB Blueprints (User, Room)
    ├── routes/             ← API Endpoints (Auth, Rooms)
    ├── .env                ← Database & Secret keys
    └── index.js            ← Backend entry point
```

---

## 📁 File-by-File Explanation (The Backend)

### 1. `server/index.js` — The Core Server
"This is the entry point of our backend. It initializes the environment and real-time engine."
*   **Socket.io Rooms**: Handles `join-room` events. When a user joins, the server adds them to a specific room ID so drawing data doesn't leak to other groups.
*   **Broadcasting**: It receives `draw` and `chat-message` events and broadcasts them to everyone in the room except the sender.
*   **Signaling**: Acts as a "Signaling Server" for WebRTC. It carries the handshake (Offer/Answer/Candidates) between peers.

### 2. `server/models/User.js` & `Room.js` — Database Schema
"These define how our data is structured in MongoDB."
*   **User Schema**: Stores `username`, `email`, and `password` (hashed with bcrypt).
*   **Room Schema**: Tracks room names, descriptions, and the "host" of the room.

### 3. `server/routes/auth.js` — Security Hub
*   **Google Login**: verifies the Google `idToken` sent from the frontend and creates/logs in the user.
*   **JWT Generation**: After a valid login, it generates a **JSON Web Token (JWT)**, which the client uses for all future authenticated requests.

---

## 📁 File-by-File Explanation (The Frontend)

### 1. `client/src/pages/Room.jsx` — The Collaboration Hub
"This is the most complex file in the project. It integrates everything."
*   **WebRTC Logic**: Manages `RTCPeerConnection` objects. When someone shares their screen, this file creates an "Offer" and sends it via Socket.io.
*   **Dynamic Overlay**: Handles the "Maximize" feature we built, allowing you to focus on one stream in a centered, premium-style popup.

### 2. `client/src/components/Whiteboard.jsx` — The Creative Side
*   **Canvas API**: Uses the HTML5 Canvas to handle mouse/touch drawing.
*   **Real-time sync**: Every time a line is drawn, it emits the coordinates via the `socket` prop passed from `Room.jsx`.

### 3. `client/src/hooks/useSocket.js` — The Connection Hook
*   **Persistent Connection**: Uses `useRef` to hold the socket object so it doesn't disconnect on every React re-render.
*   **Cleanup**: Automatically disconnects the socket when the user leaves the room to save server resources.

### 4. `client/src/context/AuthContext.jsx` — Global Session
*   **Single Source of Truth**: Stores the `user` object and provides `login` / `logout` functions to the entire app. It ensures the app knows who is logged in at all times.

---

## 🧩 React Concepts: Props & State
Explain these in your Viva to show deep React knowledge:

| Concept | Usage in this Project |
| :--- | :--- |
| **Props** | Used to pass the `socket` instance from `Room.jsx` down to `Whiteboard.jsx` and `Chat.jsx`. |
| **State** | `isSharing` and `isFaceCamActive` are states used to toggle UI elements (like the video bubbles). |
| **Refs** | `localStreamRef` is a Ref used to hold the MediaStream object without triggering a re-render. |

---

## 🛡️ WebRTC & Socket.io (The Networking Part)

### ❓ How does someone see my Video? (Viva Favorite!)
1.  **Handshake**: My browser creates an "Offer" (SDP) and sends it through **Socket.io**.
2.  **Signaling**: The other user receives the offer and sends back an "Answer."
3.  **Candidates**: We exchange **ICE Candidates** (network paths like IP addresses).
4.  **P2P**: Once the path is found, the video data travels directly from my PC to theirs (Peer-to-Peer).

---

## 🎯 Top Likely Viva Questions

**Q: Why use Vite instead of Create React App (CRA)?**
*   *A: Vite is much faster because it uses 'Native ESM' for development, making hot-reloads nearly instant compared to older tools that bundle the whole app.*

**Q: What is the purpose of `.env` files?**
*   *A: To store sensitive data like `MONGODB_URI` and `JWT_SECRET`. We keep these separate from code to follow security best practices.*

**Q: Why is Socket.io better than standard WebSockets?**
*   *A: Socket.io provides automatic reconnection, "Rooms" functionality, and a fallback to 'long-polling' if WebSockets are blocked by a firewall.*

**Q: How do you prevent unauthorized people from joining a room?**
*   *A: We use a `ProtectedRoute` component on the frontend and JWT verification on the backend to ensure only authenticated users can access the collaboration features.*

---
**This guide is ready for your viva tomorrow! Good luck!**
