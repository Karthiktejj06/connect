# 🎓 CONFESS: Complete Project Explanation for Viva

This document provides a deep dive into the technical architecture, core logic, and technology stack of the **CONFESS** anonymous confession wall.

---

## 1. Project Abstract
**CONFESS** is an anonymous confession wall web application. It allows users to authenticate via Google, post anonymous confessions, and interact with the community through several "Aura" reactions.

### 🏗️ Technology Stack (MERN-Lite)
*   **M (MongoDB)**: Scalable NoSQL database for storing confessions.
*   **E (Express.js)**: Minimalist backend framework for routing and APIs.
*   **N (Node.js)**: Fast, event-driven JavaScript runtime.
*   **Frontend**: Plain **HTML, CSS, and Vanilla JavaScript** (No React) — focuses on core platform performance and clean design.

---

## 2. Project Folder Structure
```text
minorpro/
├── config/             ← db.js: MongoDB connection settings
├── middleware/         ← auth.js: Security gate for protected routes
├── models/             ← Confession.js: Defines data structure (Schema)
├── routes/             ← auth.js, confessions.js, user.js (API Logic)
├── public/             ← Frontend assets (index.html, style.css, app.js)
├── server.js           ← Main entry point of the application
├── .env                ← Secret credentials (Client IDs, Database URLs)
└── package.json        ← Dependencies and script configurations
```

---

## 3. File-by-File Breakdown (Technical Logic)

### 🔵 `server.js` (The Heart)
*   Integrates all middleware: `cors`, `json parsing`, `session management`.
*   Initializes **Passport.js** for Google OAuth 2.0.
*   Serves static files from the `public` folder using `express.static('public')`.

### 🍃 `models/Confession.js` (Data Schema)
*   **Text**: String (Confession content).
*   **SecretCode**: String (Min 4 chars) — Enables editing/deletion without needing personal identity.
*   **Reactions**: Numeric fields for Like, Dislike, Love, and Laugh.
*   **UserId**: Links the confession to a user account internally for filtering.

### 🔐 `middleware/auth.js` (Security)
*   Uses `req.isAuthenticated()` from Passport.js to ensure only logged-in users can post or manage confessions.

### 🚀 `routes/confessions.js` (The Core API)
*   **POST**: Creates new confessions.
*   **GET**: Retrieves all confessions, sorted by newest first.
*   **PUT/DELETE**: Modifies or removes confessions ONLY if the provided `secretCode` matches the one in the database.
*   **Reaction Logic**: Uses the `$inc` operator for **Atomic Updates**, ensuring reaction counts are incremented correctly even if multiple people click at once.

---

## 4. Frontend Logic (`public/app.js`)
*   **`checkAuth()`**: Calls `/api/user` on load to determine UI state (Show Login vs Logout).
*   **`loadConfessions()`**: Fetches data from the API and dynamically builds the HTML cards.
*   **`handleReaction()`**: Updates the UI instantly (Optimistic UI) and syncs with the database.
*   **`escapeHtml()`**: A critical security function that sanitizes user input to prevent **XSS (Cross-Site Scripting)** attacks.

---

## 5. Security & Flow (Viva Context)

### 🔑 Google OAuth 2.0 Flow
1.  **Request**: User clicks Login → Redirected to Google.
2.  **Consent**: Google verifies user identity and redirects back with a "Code."
3.  **Token Exchange**: Server exchanges code for a profile.
4.  **Session**: User profile is stored in `req.user` and a session cookie is saved in the browser.

### 🤫 How is it still "Anonymous"?
Even though users log in, their name/profile is never displayed on the card. The `secretCode` adds a second layer of anonymity: only the person with the code (not even the admin) knows for sure who can edit that specific post.

---

## 6. Likely Viva Questions & Answers

**Q: Why use a NoSQL database (MongoDB) for this?**
*   *Answer:* Confessions have variable length and reactions can change. MongoDB's flexible schema and atomic `$inc` operator make it perfect for social-like data structures.

**Q: What is the purpose of `.env`?**
*   *Answer:* It stores sensitive API keys and database credentials. It is never uploaded to GitHub to prevent security leaks (Data Privacy).

**Q: How does the server know a user is logged in?**
*   *Answer:* Via **Sessions**. After login, a Session ID is stored in a cookie. For every request, the browser sends this cookie, and the server maps it to the user's data.

**Q: What is Passport.js?**
*   *Answer:* It is a flexible authentication middleware for Node.js. It supports "Strategies" like Google, Facebook, or Local, handling the heavy lifting of the OAuth handshake.

---
**Good luck with your presentation! This project demonstrates strong full-stack fundamentals.**
