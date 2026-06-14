# Real-Time Chat Application Project Diagrams

This document contains standard, clean, and professional UML and architecture diagrams for your MERN + Socket.io Real-Time Chat Application. You can copy the **Mermaid.js** code blocks below and paste them into [mermaid.live](https://mermaid.live) to download them as PNG, SVG, or copy them to your clipboard to insert in Microsoft Word.

---

## 1. Use Case Diagram

```mermaid
graph LR
    subgraph UserSpace [Actors]
        User(((User / Client)))
    end

    subgraph SystemBoundary [Real-Time Chat Application System]
        UC1(Account Registration / Sign Up)
        UC2(Account Authentication / Login & Logout)
        UC3(Update Profile Picture)
        UC4(View Contact List)
        UC5(Toggle Online Status Filter)
        UC6(Choose UI Theme - 32 options)
        UC7(Select Chat Contact)
        UC8(Send Text Message)
        UC9(Send Image Message)
    end

    subgraph ExternalSystems [External Systems]
        Cloudinary[(Cloudinary API - Media Hosting)]
        DB[(Database Server)]
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9

    UC3 -.->|<<extends>> uploads file| Cloudinary
    UC9 -.->|<<extends>> uploads attachment| Cloudinary

    UC1 -.->|saves credentials| DB
    UC2 -.->|verifies/updates session| DB
    UC3 -.->|saves image URL| DB
    UC4 -.->|fetches contacts| DB
    UC8 -.->|saves text message| DB
    UC9 -.->|saves image URL| DB

    style SystemBoundary fill:#fafafa,stroke:#333,stroke-width:2px
    style User fill:#e6f2ff,stroke:#0066cc,stroke-width:2px
    style Cloudinary fill:#f9f0ff,stroke:#722ed1,stroke-width:2px
    style DB fill:#fff7e6,stroke:#fa8c16,stroke-width:2px
```

---

## 2. Activity Diagram

```mermaid
flowchart TD
    Start([● Start: User opens web app]) --> AuthCheck{JWT token in cookies?}

    AuthCheck -- No --> RedirectLogin[Redirect to Login/SignUp Page]
    RedirectLogin --> EnterCreds[User enters credentials]
    EnterCreds --> SetJWT[Verify & set JWT Cookie]
    SetJWT --> Dashboard[Dashboard Lifecycle]

    AuthCheck -- Yes --> Dashboard[Enter Dashboard]

    Dashboard --> ActionFork{Choose Action}

    ActionFork -->|Choose Theme| ClickTheme[Click Theme]
    ClickTheme --> SaveLocal[Save Theme to LocalStorage]
    SaveLocal --> ApplyCSS[Apply CSS variables to UI wrapper]
    ApplyCSS --> Dashboard

    ActionFork -->|Select Contact| ClickContact[Click Contact]
    ClickContact --> ReadEndpoint[Call markMessagesAsRead endpoint]
    ReadEndpoint --> UpdateUnread[Update unread badge counter to 0]
    UpdateUnread --> FetchHistory[Fetch & load chat history]
    FetchHistory --> Dashboard

    ActionFork -->|Send Message| ComposeMsg[Compose message and click Send]
    ComposeMsg --> ImageCheck{Is there an image attachment?}
    
    ImageCheck -- Yes --> ConvertBase64[Convert image to Base64]
    ConvertBase64 --> PostImg[Send POST request to server]
    PostImg --> UploadCloud[Upload image to Cloudinary CDN]
    UploadCloud --> StoreImgDB[Store secure URL and metadata in MongoDB]
    StoreImgDB --> DispatchCheck

    ImageCheck -- No --> PostText[Send POST request to server]
    PostText --> StoreTextDB[Store message text in MongoDB]
    StoreTextDB --> DispatchCheck

    DispatchCheck{Is receiver's socket online?}
    DispatchCheck -- Yes --> EmitSocket[Emit 'newMessage' event to receiver's socket ID]
    EmitSocket --> UpdateUI[Update receiver's messages UI state]
    EmitSocket --> Dashboard
    
    DispatchCheck -- No --> DBOnly[Message remains stored in MongoDB only]
    DBOnly --> Dashboard

    ActionFork -->|Logout| Logout[Click Logout]
    Logout --> ClearJWT[Clear JWT cookie]
    ClearJWT --> DisconnectSocket[Disconnect Socket.io connection]
    DisconnectSocket --> EndState([◎ End: App Closed])

    style Start fill:#52c41a,stroke:#3f9112,color:#fff
    style EndState fill:#f5222d,stroke:#a8071a,color:#fff
    style AuthCheck fill:#ffe58f,stroke:#d4b106
    style ImageCheck fill:#ffe58f,stroke:#d4b106
    style DispatchCheck fill:#ffe58f,stroke:#d4b106
    style ActionFork fill:#ffe58f,stroke:#d4b106
```

---

## 3. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User A as User A (Client Browser)
    participant Zustand as Zustand Store (Frontend State)
    participant Server as Express Server (Backend REST API)
    participant Cloudinary as Cloudinary CDN (External Storage)
    participant MongoDB as MongoDB Atlas (Database)
    participant Socket as Socket.io (WebSocket Server)
    actor User B as User B (Client Browser)

    User A->>Zustand: Attach image, type text, click Send
    activate Zustand
    Zustand->>Zustand: Trigger sendMessage({ text, imagePreview })
    
    Zustand->>Server: HTTP POST /api/messages/send/:receiverId (text & base64)
    deactivate Zustand
    activate Server
    
    Server->>Cloudinary: Upload base64 image string
    activate Cloudinary
    Cloudinary-->>Server: Return secure image URL
    deactivate Cloudinary
    
    Server->>MongoDB: Save Message document (senderId, receiverId, text, imageURL)
    activate MongoDB
    MongoDB-->>Server: Confirm write success (201 Created)
    deactivate MongoDB
    
    Server->>Socket: Look up User B socket ID in userSocketMap & trigger emit("newMessage")
    activate Socket
    Socket-->>User B: Broadcast message payload over active WebSocket
    deactivate Socket
    activate User B
    User B->>User B: Zustand store receives event & appends to chat UI
    deactivate User B
    
    Server-->>User A: Return HTTP 201 Created response
    deactivate Server
```

---

## 4. Database Design (ERD)

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String email "Unique, Indexed"
        String fullName
        String password "Hashed"
        String profilePic "Cloudinary URL"
        Timestamp createdAt
        Timestamp updatedAt
    }

    MESSAGE {
        ObjectId _id PK
        ObjectId senderId FK "references User._id"
        ObjectId receiverId FK "references User._id"
        String text "Optional"
        String image "Optional, Cloudinary URL"
        Boolean read "Default: false"
        Timestamp createdAt
        Timestamp updatedAt
    }

    USER ||--o{ MESSAGE : "sends (as senderId)"
    USER ||--o{ MESSAGE : "receives (as receiverId)"
```

---

## 5. System Architecture Diagram

```mermaid
flowchart TD
    subgraph ClientTier [Client Tier - Frontend - Hosted on Vercel CDN]
        direction LR
        Browser["🌐 Web Browser"]
        subgraph ReactApp [React.js Application]
            direction TB
            UI["daisyUI & TailwindCSS (UI Components)"]
            Store["Zustand (State Store)"]
            UI <--> Store
        end
        Browser === ReactApp
    end

    subgraph ServerTier [Server Tier - Backend - Hosted on Render]
        direction TB
        NodeServer["🟢 Node.js Runtime"]
        subgraph AppServer [Application Server]
            Express["Express.js (REST API Router)"]
            SocketServer["⚡ Socket.io (WebSockets Server)"]
        end
        NodeServer === AppServer
    end

    subgraph DataTier [Cloud / Data Tier]
        direction LR
        MongoDB[("🍃 MongoDB Atlas<br>(User & Message Records)")]
        Cloudinary[("☁️ Cloudinary CDN<br>(Profile Pics & Chat Attachments)")]
    end

    Store -->|HTTPS REST / Axios| Express
    Store <-->|WSS / WebSocket Secure| SocketServer
    Express -->|MongoDB Wire Protocol| MongoDB
    Express -->|API Upload / Fetch| Cloudinary

    style ClientTier fill:#e6f2ff,stroke:#3399ff,stroke-width:2px,color:#000
    style ServerTier fill:#f2ffe6,stroke:#7acc29,stroke-width:2px,color:#000
    style DataTier fill:#fff2e6,stroke:#ff9933,stroke-width:2px,color:#000
    style Browser fill:#fff,stroke:#333,stroke-width:1px
    style ReactApp fill:#e6f7ff,stroke:#1890ff,stroke-width:1px
    style AppServer fill:#f6ffed,stroke:#52c41a,stroke-width:1px
    style MongoDB fill:#f6ffed,stroke:#389e0d,stroke-width:1.5px
    style Cloudinary fill:#e6f7ff,stroke:#096dd9,stroke-width:1.5px
```
