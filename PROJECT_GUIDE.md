# 🎓 Connect (AuraBoard): Project Guide & Viva Prep

This document provides a deep dive into the technical architecture, core logic, and technology stack of the **Connect** collaborative whiteboard project.

---

## 1. Project Abstract
**Connect** is a real-time, multi-user collaborative suite. It enables users to draw on a shared canvas, communicate via instant chat, and engage in high-quality video conferencing and screen sharing. It is built using the **MERN** stack and utilizes **Socket.io** and **WebRTC** for low-latency communication.

---

## 2. Technology Stack (Deep Dive)

### 🟡 JavaScript (The Heart)
*   **Asynchronous Programming**: Extensive use of `async/await` and `Promises` for handling network requests (Signaling, DB queries) and media stream acquisition.
*   **ES6+ Features**: Uses arrow functions, destructuring, and spread operators for clean, modern code.
*   **Event-Driven**: JavaScript's event loop is utilized to handle real-time UI updates without blocking the browser thread.

### ⚛️ React.js (The User Interface)
*   **Virtual DOM**: React updates only the changed parts of the UI, which is critical when drawing data or video streams are refreshing many times per second.
*   **Custom Hooks**:
    *   `useSocket`: Manages the lifecycle of the WebSocket connection.
    *   `useState` & `useEffect`: Manage component state and side effects (like attaching socket listeners).
    *   `useRef`: Provides direct access to DOM elements (like `<canvas>` and `<video>`) and persists WebRTC Peer Connections across re-renders without triggering them.

### 🟢 Node.js & Express (The Engine)
*   **Non-Blocking I/O**: Node.js handles multiple concurrent socket connections efficiently on a single thread.
*   **Middleware**: Express middleware is used for parsing JSON and handling CORS (Cross-Origin Resource Sharing).
*   **RESTful APIs**: Provides endpoints for User Authentication, Room Creation, and Profile Management.

### 🍃 MongoDB & Mongoose (The Data)
*   **NoSQL Database**: Stores user information and room metadata in a flexible JSON-like format (BSON).
*   **Mongoose**: An ODM (Object Data Modeling) library that provides schema validation and easy interaction with MongoDB.
*   **Scalability**: MongoDB's document-based structure allows the project to scale horizontally if users grow.

---

## 3. Core Technical Logic

### 🔴 Real-Time Synchronization (Socket.io)
Socket.io provides a **Full-Duplex** connection. Unlike standard HTTP (where the client must ask for data), the server can **push** data to the client.
*   **Drawing**: When you move your mouse, a `draw` event is emitted. The server receives it and immediately "broadcasts" it to all other sockets in the same room.
*   **Rooms**: Users are grouped into distinct "Room IDs" to ensure that drawing or chat data from Room A doesn't leak into Room B.

### 🔵 Video Calling & Screen Sharing (WebRTC)
WebRTC allows **Peer-to-Peer (P2P)** communication.
1.  **Signaling**: Peers use the Socket.io server as a "middleman" to exchange connection details (Off-er/Answer).
2.  **STUN Servers**: We use Google's STUN servers to identify the public IP address of each user so they can find each other across different networks.
3.  **MediaStream API**: Captures video/audio from `getUserMedia` (camera) and `getDisplayMedia` (screen).

---

## 4. Key Improvements & Bug Fixes (Proof of Work)
Mention these to show you understand the "inner workings" of the code:
1.  **WebRTC Signaling Fix**: Standardized the event naming for ICE candidates to prevent connection drops.
2.  **State Management**: Implemented "functional state updates" in React to solve the "Stale Closure" problem where old data was interfering with new UI states.
3.  **Authentication Security**: Integrated Google OAuth 2.0 with JWT, ensuring that user tokens are validated on every request.
4.  **UI/UX Refinement**: Created a "Focused Focus" mode where clicking a user's bubble maximizes their stream to a centered, premium-look overlay.

---

## 6. Data Flow: React Props (Component Communication)
In React, **Props** (short for properties) are used to pass data from a parent component to a child component. This is essential for maintaining a "Single Source of Truth."

### 🏗️ Major Props Usage:
*   **`Whiteboard` Component**:
    *   *Props*: `socket`, `roomId`, `tool`, `color`, `size`.
    *   *Purpose*: The parent (`Room.jsx`) owns the state of the drawing settings. It passes these as props so the Whiteboard knows what color to draw and where to send the data.
*   **`Toolbar` Component**:
    *   *Props*: `tool`, `setTool`, `color`, `setColor`, `size`, `setSize`.
    *   *Purpose*: This component receives **functions as props** (`setTool`, `setColor`). When you click a button in the toolbar, it calls these functions to update the state in the parent.
*   **`Chat` Component**:
    *   *Props*: `socket`, `roomId`, `user`.
    *   *Purpose*: Passes the shared socket instance and room identification so the chat knows which "channel" to listen to.
*   **`ProtectedRoute` Component**:
    *   *Props*: `children`.
    *   *Purpose*: It uses the `children` prop to wrap other components (like `Home` or `Room`), acting as a security gatekeeper.

---

## 7. Potential Viva Questions (Q&A)

**Q1: What is the role of `Socket.io` in WebRTC?**
*   *Answer:* WebRTC is P2P, but peers don't know each other exists. Socket.io acts as the **Signaling Channel**. It carries the handshake (Offer/Answer) between users so they can establish a direct data path.

**Q2: Why use `useRef` for the canvas and video elements?**
*   *Answer:* Re-rendering a React component destroys and recreates variables. `useRef` keeps a persistent reference to the actual DOM node (Canvas context or Video element) that survives re-renders, allowing us to manipulate the drawing/stream directly and efficiently.

**Q3: How do you handle user authentication?**
*   *Answer:* We use a hybrid approach. Google sign-in provides the initial identity, which our server verifies. We then issue a **JWT (JSON Web Token)** that is stored in the user's browser (localStorage) and sent in the header of every subsequent API call for security.

**Q4: How would you improve this project for a million users?**
*   *Answer:* I would introduce **Redis** to handle Socket.io scaling across multiple backend servers and use a **TURN server** for reliable WebRTC connections in restricted networks.

---
**Prepared with ❤️ for your presentation. Good luck!**
