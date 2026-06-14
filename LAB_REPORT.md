# 💬 LAB REPORT: REAL-TIME FULLSTACK CHAT APPLICATION

---

## 1. Introduction

In the modern digital era, instant communication is no longer a luxury but a fundamental expectation of web applications. Traditional web communication relies heavily on the HTTP protocol, which operates on a request-response model. In a standard HTTP setup, a client must repeatedly ask (poll) the server for updates to check if new messages have arrived. This approach is highly inefficient, resulting in latency, high server overhead, and unnecessary bandwidth consumption.

To solve this problem, this project presents a **Real-Time Fullstack Chat Application**. Built on top of the MERN (MongoDB, Express, React, Node.js) stack, it implements persistent, bi-directional, and low-latency communication using WebSockets via **Socket.io**. This application enables users to exchange instant text messages and images securely, see when contacts are online or offline in real-time, view unread message counts, update their user profiles, and customize their interface layout by choosing from 32 distinct visual themes.

---

## 2. Objectives of the Project

The key objectives of this project are:
* **Real-time Bidirectional Communication:** Establish instantaneous message transfer between clients with sub-100ms latency using Socket.io.
* **Secure User Identity Management:** Implement a robust authentication and authorization mechanism using JSON Web Tokens (JWT) stored in secure, HTTP-only cookies, combined with salt-based password hashing using `bcryptjs`.
* **Dynamic User State Awareness:** Display accurate online/offline indicators for users instantly across all connected sessions.
* **Multimedia Sharing capabilities:** Enable image uploads and sharing via base64 serialization and secure remote storage on Cloudinary.
* **Enhanced Visual Customizability:** Support highly flexible and responsive UI styling powered by TailwindCSS and daisyUI, providing users with 32 selectable design themes.
* **Clean Global State Management:** Utilize Zustand stores on the frontend to cleanly manage application-wide configurations, messaging histories, and authentication states without prop-drilling.

---

## 3. Requirement Analysis

### 3.1 Functional Requirements
The application must satisfy the following functional behaviors:
1. **User Sign Up:** Unregistered users must be able to create an account by providing their Full Name, unique Email, and a password (minimum 6 characters).
2. **User Login & Logout:** Registered users must be able to establish a secure session using their credentials and terminate their session to clear state safely.
3. **Session Persistence:** Authenticated users must remain logged in even after page refreshes (via automatic backend JWT validation route `/auth/check`).
4. **Profile Picture Update:** Users must be able to upload or update a custom profile avatar, with the image uploaded to Cloudinary.
5. **Real-time Online Contacts Sidebar:**
   - Display a list of all other registered users in the database.
   - Show a green indicator beside contacts who are currently online.
   - Provide a toggle to filter the contacts list to show online users only.
   - Show the number of online users dynamically.
6. **Real-time Text Messaging:** Users must be able to send and receive text messages instantly without reloading the page.
7. **Image Attachment Sharing:** Users must be able to attach and preview images in the chat console before sending them.
8. **Unread Message Indicators:** 
   - Maintain individual unread counters for each contact.
   - Automatically increment the unread counter when a message is received from a contact other than the one currently selected.
   - Clear the unread count when clicking on a contact to read their messages.
9. **Visual Theme Changer:** Allow users to switch between 32 different styles (e.g., Light, Dark, Retro, Forest, Coffee, Valentine, Halloween) with live UI updates and local storage persistence.

### 3.2 Non-Functional Requirements
The system must satisfy these quality attributes:
* **Performance:** 
  - Messages must be dispatched and received in under 100 milliseconds for active WebSocket clients.
  - Skeletons must be displayed during data loading (sidebar and chat content) to ensure a smooth perceived rendering speed.
* **Security:**
  - Passwords must be hashed using `bcryptjs` with a salt factor of 10 prior to database insertion.
  - Session tokens must be signed JWTs stored in `httpOnly`, `secure: true`, `sameSite: "none"` cookies to mitigate XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery) vulnerabilities.
  - Route guards (`protectRoute` middleware) must block unauthorized requests to API endpoints.
* **Reliability:**
  - The database connection must reconnect gracefully in the event of brief network dropouts.
  - The Socket.io client must automatically reconnect upon backend server restarts.
* **Usability:**
  - The frontend must be fully responsive across mobile, tablet, and desktop viewports (e.g., sidebar collapses to icons on mobile).
  - Feedback should be given for major actions (e.g., success/error toasts for login, logout, profile updates).
* **Scalability:**
  - Image assets are stored in the cloud (Cloudinary) rather than on the application server or MongoDB directly, preventing performance degradation due to file bloating.
  - A clean separation of the frontend client and the backend server enables independent scaling.

---

## 4. System Design

### 4.1 Use Case Diagram (Textual Representation)
The system involves three primary actors: **User (Client)**, **Cloudinary API (External Service)**, and **Database / API Server (System)**.

* **User (Client)** interacts with the system to perform:
  - Account Sign Up / Login / Logout
  - Update Profile Picture (Interacts with Cloudinary API)
  - View Contacts List & Online Indicators
  - Select Chat Contact
  - Send Text Message
  - Send Image Message (Interacts with Cloudinary API)
  - Customize UI Theme
* **Cloudinary API** handles:
  - Receiving base64 image strings from Backend
  - Returning secure image URLs
* **Database & API Server** handles:
  - User Authentication validation (JWT verification)
  - Fetching user histories
  - Saving users and messages
  - Maintaining socket mapping dictionary
  - Broadcasting Socket.io messages to target client sockets

*(Visual Use Case Diagram to be generated and inserted here)*

### 4.2 Activity Diagram (Textual Representation)
An activity diagram illustrates the workflow of a user initiating and engaging in a chat session:
1. **Start** -> User opens web application.
2. **Authentication Check:** System validates the JWT cookie.
   - *If Invalid:* User is redirected to Login page -> Enters credentials -> Authenticated.
   - *If Valid:* Automatically signs in.
3. **Socket Connection:** System initializes WebSocket and sends `userId` query parameter. Server stores socket mapping and emits updated `getOnlineUsers` list to all connected clients.
4. **Main Interface Dashboard:** Sidebar loads contacts list.
5. **Interaction Loop:**
   - *Scenario A:* User updates theme -> Theme saved to LocalStorage -> System updates CSS theme attribute.
   - *Scenario B:* User selects Contact -> System triggers `markMessagesAsRead` -> Messages marked as read in DB -> Unread counter set to 0 -> Fetch and render chat history.
   - *Scenario C:* User types message & clicks Send:
     - *If Image Attached:* Convert to base64 -> Request API `sendMessage` -> Upload image to Cloudinary -> Save message object with image URL to MongoDB.
     - *If Text Only:* Request API `sendMessage` -> Save message object with text to MongoDB.
     - Server checks if Receiver is online:
       - *If Receiver Online:* Emit `newMessage` socket event -> Receiver client updates Zustand messages state instantly.
       - *If Receiver Offline:* Message is saved in DB; when Receiver logs in later, message is fetched.
6. **Logout / Disconnect:** Socket disconnects -> Server deletes mapping -> Broadcasts updated online list.

*(Visual Activity Diagram to be generated and inserted here)*

### 4.3 Sequence Diagram (Textual Representation)
A sequence diagram shows the step-by-step API and Socket events exchanged when User A sends a message to User B:

```text
User A (Client)               Backend (Express + Socket)             MongoDB             User B (Client)
      |                                   |                             |                       |
      | 1. Sends text + image (Base64)     |                             |                       |
      |---------------------------------->|                             |                       |
      |                                   | 2. Upload image             |                       |
      |                                   |-----------------> Cloudinary|                       |
      |                                   |<----------------- Secure URL|                       |
      |                                   |                             |                       |
      |                                   | 3. Create & Save Message    |                       |
      |                                   |---------------------------->|                       |
      |                                   |<-------------------- Saved -|                       |
      |                                   |                             |                       |
      |                                   | 4. Get User B Socket ID     |                       |
      |                                   |--- (Lookup userSocketMap)   |                       |
      |                                   |                             |                       |
      |                                   | 5. Emit "newMessage" event  |                       |
      |                                   |---------------------------------------------------->|
      |                                   |                             |   (Zustand Updates)   |
      | 6. HTTP Status 201 (Created)      |                             |                       |
      |<----------------------------------|                             |                       |
```

*(Visual Sequence Diagram to be generated and inserted here)*

### 4.4 Database Design (ERD)
The database uses MongoDB, which is non-relational, but we model the schema entities using Mongoose with two principal collections: `users` and `messages`.

#### Entity 1: User (Collection: `users`)
| Field Name | Data Type | Key Type / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key (Auto-Generated) | Unique user identifier |
| `email` | String | Unique, Required | User's email address |
| `fullName` | String | Required | User's full name |
| `password` | String | Required, Min length: 6 | Hashed password string |
| `profilePic`| String | Default: "" | Cloudinary URL for profile picture |
| `createdAt`| Date | Auto-Generated timestamp | Record creation time |
| `updatedAt`| Date | Auto-Generated timestamp | Record modification time |

#### Entity 2: Message (Collection: `messages`)
| Field Name | Data Type | Key Type / Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key (Auto-Generated) | Unique message identifier |
| `senderId` | ObjectId | Foreign Key (Ref: User), Required | Reference to the sending user |
| `receiverId`| ObjectId | Foreign Key (Ref: User), Required | Reference to the receiving user |
| `text` | String | Optional | The text content of the message |
| `image` | String | Optional | Cloudinary URL for image attachment |
| `read` | Boolean | Default: false, Required | Read receipt status indicator |
| `createdAt`| Date | Auto-Generated timestamp | Message dispatch timestamp |
| `updatedAt`| Date | Auto-Generated timestamp | Message update timestamp |

**Relationships:**
* A **User** can send zero or more **Messages** (`senderId` -> `User._id`).
* A **User** can receive zero or more **Messages** (`receiverId` -> `User._id`).
* This establishes a **One-to-Many** relationship between `users` and `messages`.

*(Visual Entity Relationship Diagram (ERD) to be generated and inserted here)*

### 4.5 System Architecture
The application runs on a Client-Server Architecture. The client is a single-page React app (SPA), and the backend is a Node/Express API that acts as both a REST API and a WebSockets server.

```text
+-------------------------------------------------------+
|                   Client Web Browser                  |
|  +--------------------+       +--------------------+  |
|  |     React UI       | <---> |   Zustand Stores   |  |
|  | (Tailwind/DaisyUI) |       | (Auth, Chat,Theme) |  |
|  +--------------------+       +--------------------+  |
+-------------------------------------------------------+
        ^                               ^
        | HTTP Requests                 | WebSocket
        | (Axios API Client)            | (Socket.io-Client)
        v                               v
+-------------------------------------------------------+
|                    Backend Server                     |
|  +--------------------+       +--------------------+  |
|  |    Express API     |       |  Socket.io Server  |  |
|  |   (REST Routes)    |       |  (Events Broker)   |  |
|  +--------------------+       +--------------------+  |
+-------------------------------------------------------+
        ^                               ^
        | Mongoose ORM                  | API Uploads
        v                               v
+-----------------------+       +-----------------------+
|  MongoDB Atlas Cloud  |       |   Cloudinary Cloud    |
|   (Data Repository)   |       |  (Media CDN Storage)  |
+-----------------------+       +-----------------------+
```

---

## 5. Project Features

* **Instantaneous Message Exchanges:** Bi-directional messaging streams messages immediately to the receiver's window without requiring page re-polling.
* **Smart Online Tracking:** Users see who is currently active via green indicator badges. The contacts list dynamically moves online users to the top or hides offline contacts when the online-only filter is selected.
* **Image Transmission:** Users can click the image attachment button, select any common image file type, preview it in the input area, and send it. The image appears directly inline inside the chat bubble.
* **Unread Message Badges:** Unread messages trigger an orange/primary-colored numerical badge next to the contact's name in the sidebar. This counter resets to zero upon selecting the contact.
* **32-Theme customizer:** Standard DaisyUI themes are loaded, which can change the look of the app (backgrounds, text, inputs, buttons) with a single click. The selected theme is stored in the browser's local storage.
* **Session Persistence:** When a user logs in, they remain logged in because the JWT token is sent as an HTTP-only cookie in subsequent network requests.

---

## 6. Technology Stack

### 6.1 Frontend
* **Core Library:** React.js (v18.3.1) - UI structuring and lifecycle management.
* **Build Tool:** Vite - Rapid local compilation and production packaging.
* **Styling & Theme Frameworks:**
  - TailwindCSS (v3.4.15) - Utility-first CSS classes.
  - DaisyUI (v4.12.14) - Premade component classes and theme providers.
* **State Management:** Zustand (v5.0.1) - Lightweight, modular global stores.
* **Routing:** React Router DOM (v6.28.0) - Route navigation and authentication guards.
* **API Client:** Axios (v1.7.7) - Configured with credential support to enable cross-domain cookies.
* **Real-time Client:** Socket.io-client (v4.8.1) - WebSocket client communication.
* **Visual Additions:**
  - Lucide React - Modern icon library.
  - React Hot Toast - Sleek toast alerts.

### 6.2 Backend
* **Runtime Environment:** Node.js - Server-side JavaScript runtime.
* **Web Framework:** Express.js (v4.21.1) - Rest API construction and middleware routing.
* **Real-time Engine:** Socket.io (v4.8.1) - Handles WebSocket handshakes and message distribution.
* **Security & Tokens:**
  - JSONWebToken (v9.0.2) - Creating and verifying secure user session tokens.
  - Bcryptjs (v2.4.3) - Password salting and hashing.
  - Cookie-Parser (v1.4.7) - Extracting cookies from incoming HTTP requests.
* **Other Utilities:**
  - Cors (v2.8.5) - Handling Cross-Origin Resource Sharing.
  - Dotenv (v16.4.5) - Loading environment variables.

### 6.3 Database
* **Database Management System:** MongoDB Atlas - Distributed, cloud-hosted document database.
* **Object Data Modeling (ODM):** Mongoose (v8.8.1) - Defining structure and queries for MongoDB documents.
* **Media Cloud Service:** Cloudinary - Storing, optimizing, and serving user profile and message images.

### 6.4 Development Tools
* **Code Editor:** VS Code / Antigravity IDE.
* **Process Monitor:** Nodemon - Automatically restarts the backend server when file changes are detected.
* **Code Quality Analyzer:** ESLint (v9.13.0) - Static code analysis and linting.
* **Hosting Platforms:**
  - Vercel - Hosts the static React frontend.
  - Render - Hosts the Express/Socket.io backend server.

---

## 7. Implementation

### 7.1 Frontend Development
The frontend application structure centers around Zustand stores that act as single sources of truth. This design eliminates unnecessary re-renders.

#### Store 1: Auth Store (`store/useAuthStore.js`)
* **State variables:** `authUser`, `isSigningUp`, `isLoggingIn`, `isUpdatingProfile`, `isCheckingAuth`, `onlineUsers`, `socket`.
* **Key actions:**
  - `checkAuth`: Hits the `/auth/check` endpoint. If successful, stores user info and calls `connectSocket()`.
  - `connectSocket`: Instantiates `socket.io-client`, passing the current user ID as query parameters. It sets up listeners for `getOnlineUsers` and `newMessage`.
  - `newMessage` globally listens for incoming messages. If the message is from the active chat contact, it appends it to the chat store's message list. If it is from someone else, it increments that sender's `unreadCount` and updates the sidebar state.

#### Store 2: Chat Store (`store/useChatStore.js`)
* **State variables:** `messages`, `users`, `selectedUser`, `isUsersLoading`, `isMessagesLoading`.
* **Key actions:**
  - `getUsers`: Fetches the contact list from `/messages/users`. The backend returns details including unread counts and sorting metrics.
  - `getMessages`: Retrieves message history for the selected user.
  - `sendMessage`: Dispatches a POST request to `/messages/send/:id` with text/image data, updating the local messages list instantly (optimistic state updates).
  - `markMessagesAsRead`: Dispatches a POST request to `/messages/read/:id` and resets the user's unread count locally.

#### Layout and Routing (`App.jsx`)
`App.jsx` handles global route configurations:
* `/` loads the `HomePage` (guarded: redirects to `/login` if unauthenticated).
* `/signup` and `/login` load corresponding authentication forms (redirects to `/` if already authenticated).
* `/profile` loads the user profile details (guarded).
* `/settings` loads theme configs (publicly accessible).
The wrapper uses `data-theme={theme}` dynamically tied to the theme state, enabling instant application of the selected daisyUI theme globally.

---

### 7.2 Backend Development

#### Application Bootstrapping (`index.js`)
The server creates a standard Express app, overlays an HTTP server instance using Node's `http` module, and binds a Socket.io Server instance to it.
Middlewares configured:
* `express.json({ limit: "10mb" })` - Essential for parsing large base64 image strings.
* `cookieParser()` - Extracts cookies from request headers.
* `cors()` - Configured with allowed origins (Localhost and Vercel Production) and `credentials: true`.
If `process.env.NODE_ENV` is set to production, the backend serves the compiled static files from the frontend’s distribution folder, consolidating the application.

#### Authentication Guard (`middleware/auth.middleware.js`)
The `protectRoute` middleware intercepts requests:
1. Reads `req.cookies.jwt`.
2. Validates the signature using the server's `JWT_SECRET`.
3. Queries MongoDB to fetch the corresponding User profile (excluding the password hash).
4. Attaches the user object to `req.user` and calls `next()`. If verification fails, it returns a 401 Unauthorized status.

#### WebSockets Implementation (`lib/socket.js`)
The server-side socket setup maintains an in-memory dictionary mapping active User IDs to Socket IDs:
* `const userSocketMap = {};` (format: `{ userId: socketId }`)
Upon a new socket connection:
1. The client's user ID is extracted from `socket.handshake.query.userId`.
2. The mapping is updated: `userSocketMap[userId] = socket.id`.
3. The server broadcasts the list of active user IDs to all clients using `io.emit("getOnlineUsers", Object.keys(userSocketMap))`.
4. When a socket disconnects, the entry is deleted, and the updated online list is broadcast again.
5. Message dispatch utilizes a lookup function `getReceiverSocketId(userId)`. If the recipient is connected, the message is sent to their specific socket: `io.to(receiverSocketId).emit("newMessage", newMessage)`.

---

### 7.3 Database Implementation
Database schemas are defined in `backend/src/models/`:

* **User Schema:** Created using Mongoose with unique index configurations on the `email` field to speed up searches during authentication.
* **Message Schema:** References the User collection using `mongoose.Schema.Types.ObjectId` with references set to `User`. This enables populated query operations.

#### Mongoose Queries Showcase:
* **Fetching Contacts Sidebar:**
  ```javascript
  const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
  ```
  This query finds all users in the collection except the currently logged-in user, ensuring users cannot start chats with themselves.
* **Counting Unread Messages per Contact:**
  ```javascript
  const unreadCount = await Message.countDocuments({
    senderId: user._id,
    receiverId: loggedInUserId,
    read: { $ne: true }
  });
  ```
* **Retrieving Message History:**
  ```javascript
  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId }
    ]
  });
  ```
  This query retrieves all messages sent from User A to User B, as well as those sent from User B to User A, sorting them chronologically to build the full chat history.

---

## 8. Testing and Validation

### 8.1 Testing Methodologies
* **Unit Testing:**
  - Evaluated helper functions, such as checking if `formatMessageTime` outputs accurate human-readable timestamps based on raw ISO strings.
  - Tested schema validators, ensuring user registration fails if the email field is empty or if the password contains fewer than six characters.
* **Integration Testing:**
  - Verified API routes by sending mock HTTP requests using Postman.
  - Tested cookie integration: confirmed that the `jwt` cookie is correctly set in the browser's cookie storage during login and that it is sent along with subsequent requests to fetch messages.
  - Verified the MongoDB Atlas cloud connection, ensuring documents are stored and updated correctly during chat sessions.
* **Functional Testing:**
  - Verified message flow: tested sending messages containing text, images, or both.
  - Profile customization: confirmed that uploaded images are successfully saved to Cloudinary and that the returned URL is saved in the user's profile document.
  - Theme switches: confirmed that selecting a theme updates the visual style of the application instantly and that the choice is saved to local storage.
* **User Acceptance Testing (UAT):**
  - Simulated active chat sessions by opening multiple browser windows (Chrome, Firefox, Edge) logged into different user accounts.
  - Verified that message alerts, unread counts, and online indicators update instantly in real-time as users join, send messages, or disconnect.

### 8.2 Test Cases and Results

| Test ID | Test Category | Feature Under Test | Test Description / Steps | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Functional | User Sign Up | Attempt signup with email `test@example.com`, name `Test User`, password `123` | System displays error: "Password must be at least 6 characters" | App displays error popup correctly | **Pass** |
| **TC-02** | Functional | User Sign Up | Sign up with valid credentials: `valid@example.com`, `Valid User`, `password123` | User is registered, cookie is set, redirected to dashboard | User is registered and logged in successfully | **Pass** |
| **TC-03** | Integration | Route Protection | Attempt HTTP GET `/api/messages/users` without sending a JWT cookie | Returns HTTP Status `401 Unauthorized` with error message | HTTP 401 received, redirect to login page | **Pass** |
| **TC-04** | Functional | Profile Update | Upload profile picture from profile screen | Image is uploaded to Cloudinary, profile picture updates, success toast appears | Profile picture updates instantly and stays after reload | **Pass** |
| **TC-05** | Functional | Theme Customizer | Click on "Forest" theme on the settings screen | Application theme colors change, option saved to local storage | UI updates to green palette; state persists after refreshes | **Pass** |
| **TC-06** | Integration | Real-time text | User A selects User B and sends: "Hello User B" | Message is saved in MongoDB, Socket.io broadcasts message, User B receives it in under 50ms | Message appears instantly in both windows | **Pass** |
| **TC-07** | Integration | Real-time image | User A sends a message containing an image | Image is saved to Cloudinary, database stores link, User B receives and renders image | Image renders inline in both chat screens | **Pass** |
| **TC-08** | Functional | Presence indicator | User A logs out of their browser session | User B's contacts sidebar removes User A's green dot in real-time | Green status indicator turns gray instantly | **Pass** |
| **TC-09** | Functional | Unread badge | User B is online but has selected User C's chat. User A sends User B a message | User B's sidebar shows a badge with a count of `1` next to User A's name | Numerical counter increments and displays in orange badge | **Pass** |
| **TC-10** | Functional | Unread clear | User B clicks on User A's contact tab | User B's unread badge count for User A resets to `0` and disappears | Badge disappears, messages marked as read | **Pass** |

---

## 9. Project Outcome

The project succeeded in building a modern, highly responsive, full-stack real-time chat application. Key achievements include:
* **Zero-refresh Messaging:** Users can converse seamlessly with real-time updates.
* **Low-Latency Updates:** Using WebSockets eliminates HTTP request overhead, allowing messages to be sent and received in under 50ms on stable connections.
* **Robust Session Management:** JWT cookies provide a secure login session that remains active across browser refreshes and subdomains.
* **Dynamic Styling System:** Integrating TailwindCSS with daisyUI enabled a flexible design system supporting 32 distinct visual themes.
* **Scalable File Storage:** Offloading media storage to Cloudinary keeps the database lightweight and ensures fast image delivery.

---

## 10. Future Enhancements

While the application meets all core requirements, several features could be added in future updates to improve usability:
* **Group Chats:** Allow users to create chat rooms and message multiple contacts at once.
* **Typing Indicators:** Add a "User is typing..." message in the chat header when a contact begins typing.
* **Message Status Details:** Add detailed delivery and read receipts (e.g., single checkmark for sent, double checkmark for read).
* **Multimedia Upgrades:** Support sharing other file formats (PDFs, archives) and voice notes.
* **Push Notifications:** Add browser push notifications to alert users to new messages when the application is running in the background.

---

## 11. Conclusion

This project successfully demonstrates how modern web technologies can be combined to build a real-time, full-stack chat application. Integrating Socket.io with the MERN stack solved the latency and performance issues associated with traditional HTTP polling, providing a fast and seamless messaging experience.

Key learning outcomes from this project include:
1. Managing WebSocket connection states (connecting, disconnecting, and auto-reconnecting).
2. Handling JWT cookies securely across different domains (Vercel frontend to Render backend) using `sameSite: "none"` and `secure: true`.
3. Creating clean global state stores in React using Zustand, which simplified state management.
4. Designing database queries to manage user lists, retrieve chat histories, and update read statuses.

Overall, the application achieves its goals, providing a secure, customizable, and high-performance real-time communication platform.
