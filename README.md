# 🚀 Real-Time Chat Application

A comprehensive real-time chat application built with modern web technologies, supporting personal chats, group messaging, multimedia sharing, and advanced features like mentions, voice recording, and stickers.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Implementation Details](#-implementation-details)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional event-based communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Cloud-based image and video management
- **Multer** - File upload middleware
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management

### Frontend
- **React.js** - JavaScript library for building user interfaces
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Emoji Picker React** - Emoji selection component
- **React Icons** - Icon library

### Development Tools
- **Vite** - Build tool and development server
- **Nodemon** - Development server with auto-restart
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📁 Project Structure

```
3.realtimeChatApp/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   ├── db.js              # Database connection
│   │   └── token.js           # JWT token generation
│   ├── controllers/
│   │   ├── auth.controllers.js    # Authentication logic
│   │   ├── group.controllers.js   # Group management
│   │   ├── message.controllers.js # Message handling
│   │   └── user.controllers.js    # User management
│   ├── middlewares/
│   │   ├── isAuth.js          # Authentication middleware
│   │   └── multer.js          # File upload middleware
│   ├── models/
│   │   ├── conversation.model.js  # Conversation schema
│   │   ├── message.model.js       # Message schema
│   │   └── user.model.js          # User schema
│   ├── routes/
│   │   ├── auth.routes.js     # Authentication routes
│   │   ├── group.routes.js    # Group routes
│   │   ├── message.routes.js  # Message routes
│   │   └── user.routes.js     # User routes
│   ├── socket/
│   │   └── socket.js          # Socket.io configuration
│   ├── public/                # Static files
│   ├── .env                   # Environment variables
│   ├── index.js               # Server entry point
│   └── package.json           # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MessageArea.jsx    # Chat interface
│   │   │   ├── ReceiverMessage.jsx # Received message component
│   │   │   ├── SenderMessage.jsx  # Sent message component
│   │   │   └── SideBar.jsx        # Chat list sidebar
│   │   ├── customHooks/
│   │   │   ├── getCurrentUser.jsx # Current user hook
│   │   │   ├── getMessages.jsx    # Messages hook
│   │   │   └── getOtherUsers.jsx  # Other users hook
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Main chat page
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Profile.jsx        # User profile page
│   │   │   └── SignUp.jsx         # Registration page
│   │   ├── redux/
│   │   │   ├── messageSlice.js    # Message state management
│   │   │   ├── store.js           # Redux store
│   │   │   └── userSlice.js       # User state management
│   │   ├── assets/                # Static assets
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # App entry point
│   │   └── index.css              # Global styles
│   ├── public/                    # Public assets
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite configuration
└── README.md                      # Project documentation
```

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration & Login** - Secure JWT-based authentication
- **Profile Management** - Update name, profile picture, and status
- **User Status** - Online, Away, Busy, Offline status indicators
- **Block/Mute Users** - Privacy controls for user interactions
- **User Search** - Find and connect with other users

### 💬 Messaging Features
- **Real-time Messaging** - Instant message delivery with Socket.io
- **Text Messages** - Rich text messaging with emoji support
- **Multimedia Support** - Images, videos, audio files, and documents
- **Voice Recording** - Record and send voice messages
- **GIFs & Stickers** - Visual content sharing
- **Message Reactions** - React to messages with emojis
- **Message Replies** - Reply to specific messages
- **Message Status** - Sent, delivered, and read receipts
- **Message Deletion** - Delete for self or everyone

### 👥 Group Features
- **Group Creation** - Create groups with custom names and images
- **Group Management** - Add/remove members (admin only)
- **Group Messaging** - Send messages to multiple users
- **@Mentions** - Mention specific users in group chats
- **Group Notifications** - Notifications for member join/leave events
- **Admin Controls** - Group administration features

### 🔔 Real-time Features
- **Typing Indicators** - See when someone is typing
- **Online Status** - Real-time online/offline status
- **Push Notifications** - Browser notifications for new messages
- **Live Updates** - Real-time message and status updates
- **Connection Management** - Automatic reconnection handling

### 🎨 User Interface
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Clean and intuitive interface
- **Dark/Light Theme** - Customizable appearance
- **Emoji Picker** - Easy emoji selection
- **File Upload** - Drag and drop file sharing
- **Last Message Preview** - Quick conversation overview

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/GThiruAishwarya/chatly_team_chat_system.git
   cd chatly_team_chat_system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user
```json
{
  "userName": "string",
  "email": "string",
  "password": "string"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "string",
  "password": "string"
}
```

#### GET `/api/auth/logout`
Logout user

### User Endpoints

#### GET `/api/user/current`
Get current user information

#### PUT `/api/user/profile`
Update user profile
```json
{
  "name": "string"
}
```

#### PUT `/api/user/status`
Update user status
```json
{
  "status": "online|away|busy|offline"
}
```

#### POST `/api/user/block`
Block a user
```json
{
  "targetUserId": "string"
}
```

#### POST `/api/user/mute`
Mute a user
```json
{
  "targetUserId": "string"
}
```

### Message Endpoints

#### POST `/api/message/send/:receiver`
Send a message to a user
```json
{
  "message": "string",
  "replyTo": "messageId"
}
```

#### GET `/api/message/get/:receiver`
Get messages with a user

#### GET `/api/message/last-messages`
Get conversations with last messages

#### POST `/api/message/react/:messageId`
React to a message
```json
{
  "reaction": "emoji"
}
```

### Group Endpoints

#### POST `/api/group/create`
Create a new group
```json
{
  "name": "string",
  "members": ["userId1", "userId2"]
}
```

#### POST `/api/group/send/:groupId`
Send a message to a group
```json
{
  "message": "string",
  "mentions": ["userId1", "userId2"]
}
```

#### POST `/api/group/add/:groupId`
Add a member to a group
```json
{
  "memberId": "string"
}
```

#### POST `/api/group/remove/:groupId`
Remove a member from a group
```json
{
  "memberId": "string"
}
```

## 🔧 Implementation Details

### Real-time Communication

The application uses Socket.io for real-time features:

```javascript
// Backend Socket Events
io.on("connection", (socket) => {
  // User connection
  socket.on("typing", ({ to }) => {
    // Handle typing indicators
  });
  
  socket.on("newMessage", (message) => {
    // Broadcast new messages
  });
  
  socket.on("mentioned", (data) => {
    // Handle user mentions
  });
});
```

### Authentication Flow

1. User registers/logs in
2. Server generates JWT token
3. Token stored in httpOnly cookie
4. Middleware validates token on protected routes
5. User data stored in Redux state

### Message Flow

1. User sends message via form
2. Frontend sends POST request to backend
3. Backend saves message to database
4. Socket.io broadcasts message to recipients
5. Frontend updates message list in real-time

### File Upload Process

1. User selects file
2. Multer middleware handles upload
3. File uploaded to Cloudinary
4. URL stored in database
5. Message sent with file URL

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Configuration Error
**Problem**: Backend running on wrong port
```
Error: listen EADDRINUSE: address already in use :::8000
```

**Solution**: Update `.env` file
```env
PORT=5000
```

#### 2. Database Connection Error
**Problem**: MongoDB connection failed
```
Error: db error
```

**Solution**: Check MongoDB URL in `.env`
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database
```

#### 3. CORS Error
**Problem**: Frontend can't connect to backend
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Update CORS configuration in `backend/index.js`
```javascript
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
```

#### 4. JWT Token Error
**Problem**: Authentication failed
```
Error: token is not found
```

**Solution**: Check JWT_SECRET in `.env`
```env
JWT_SECRET=your_secure_secret_key
```

#### 5. File Upload Error
**Problem**: Images not uploading
```
Error: Cloudinary upload failed
```

**Solution**: Verify Cloudinary credentials in `.env`
```env
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
```

#### 6. Socket Connection Error
**Problem**: Real-time features not working
```
Error: WebSocket connection failed
```

**Solution**: Check Socket.io configuration
```javascript
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true
  }
});
```

### Development Tips

1. **Always check console logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test API endpoints** using Postman or curl
4. **Check network tab** in browser dev tools
5. **Restart servers** after configuration changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **G. Thiru Aishwarya** - *Initial work* - [GThiruAishwarya](https://github.com/GThiruAishwarya)

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Cloudinary for file storage
- MongoDB for database
- React and Node.js communities
- All contributors and testers

---

**Note**: This is a development version. For production deployment, ensure proper security measures, environment configuration, and performance optimization.
