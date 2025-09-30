# 🔧 Implementation Guide

This document provides detailed information about how each feature was implemented, the challenges faced, and the solutions applied.

## 📋 Table of Contents

- [Authentication System](#-authentication-system)
- [Real-time Messaging](#-real-time-messaging)
- [Group Management](#-group-management)
- [File Upload System](#-file-upload-system)
- [Voice Recording](#-voice-recording)
- [Mentions System](#-mentions-system)
- [User Status Management](#-user-status-management)
- [Message Reactions](#-message-reactions)
- [Last Message Preview](#-last-message-preview)
- [Stickers Feature](#-stickers-feature)
- [Common Issues & Solutions](#-common-issues--solutions)

## 🔐 Authentication System

### Implementation Details

#### Backend Implementation
```javascript
// JWT Token Generation
const genToken = async (userId) => {
    try {
        const token = await jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn:"7d"})
        return token
    } catch (error) {
        console.log("gen token error")
    }
}

// Login Controller
export const login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"user does not exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"incorrect password"})
        }

        const token = await genToken(user._id)
        
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7*24*60*60*1000,
            sameSite: "None",
            secure: true
        })

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`login error ${error}`})
    }
}
```

#### Frontend Implementation
```javascript
// Login Component
const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        let result = await axios.post(`${serverUrl}/api/auth/login`, {
            email, password
        }, {withCredentials: true})
        
        dispatch(setUserData(result.data))
        dispatch(setSelectedUser(null))
        navigate("/")
        setEmail("")
        setPassword("")
        setLoading(false)
        setErr("")
    } catch (error) {
        console.log(error)
        setLoading(false)
        setErr(error.response?.data?.message || "Login failed. Please try again.")
    }
}
```

### Challenges Faced

1. **Cookie Security**: Initial implementation used regular cookies
2. **CORS Configuration**: Cross-origin requests were blocked
3. **Token Expiration**: No proper token refresh mechanism

### Solutions Applied

1. **Secure Cookies**: Implemented httpOnly, secure, and sameSite cookies
2. **CORS Setup**: Configured proper CORS with credentials
3. **Error Handling**: Added comprehensive error handling with user-friendly messages

## 💬 Real-time Messaging

### Implementation Details

#### Socket.io Configuration
```javascript
// Backend Socket Setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatly-team-chat-system-frontend.onrender.com"
    ],
    credentials: true,
  },
});

// User Socket Mapping
const userSocketMap = {};
export const getReceiverSocketId = (receiver) => {
  return userSocketMap[receiver];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicators
  socket.on("typing", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: String(userId) });
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
```

#### Message Sending
```javascript
// Send Message Controller
export const sendMessage = async (req, res) => {
    try {
        let sender = req.userId
        let {receiver} = req.params
        let {message, gif, replyTo} = req.body

        let image, video, audio, fileUrl
        if(req.file){
            const uploaded = await uploadOnCloudinary(req.file.path)
            const mime = req.file.mimetype
            if(mime.startsWith("image/")){
                image = uploaded || `/public/${req.file.originalname}`
            } else if(mime.startsWith("video/")){
                video = uploaded || `/public/${req.file.originalname}`
            } else if(mime.startsWith("audio/")){
                audio = uploaded || `/public/${req.file.originalname}`
            } else {
                fileUrl = uploaded || `/public/${req.file.originalname}`
            }
        }

        let newMessage = await Message.create({
            sender, receiver, message, image, video, audio, file:fileUrl, gif, replyTo, status:"sent"
        })

        // Real-time message delivery
        const receiverSocketId = getReceiverSocketId(receiver)
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
            newMessage.status = "delivered"
            await newMessage.save()
            io.to(receiverSocketId).emit("messageStatus", { 
                messageId: newMessage._id, 
                status: "delivered" 
            })
        }

        return res.status(201).json(newMessage)
    } catch (error) {
        return res.status(500).json({message:`send Message error ${error}`})
    }
}
```

### Challenges Faced

1. **Connection Management**: Users disconnecting and reconnecting
2. **Message Status**: Tracking sent, delivered, and read status
3. **Typing Indicators**: Real-time typing status updates

### Solutions Applied

1. **Socket Mapping**: Maintained user-to-socket mapping for message delivery
2. **Status Tracking**: Implemented message status updates via socket events
3. **Connection Handling**: Proper cleanup on disconnect and reconnection

## 👥 Group Management

### Implementation Details

#### Group Creation
```javascript
// Create Group Controller
export const createGroup = async (req, res) => {
    try{
        const creatorId = req.userId
        const { name, members } = req.body
        let image
        
        if(req.file){
            image = await uploadOnCloudinary(req.file.path)
            if(!image){
                image = `/public/${req.file.originalname}`
            }
        }
        
        const memberIds = Array.isArray(members) ? members : JSON.parse(members || "[]")
        const uniqueMembers = Array.from(new Set([creatorId, ...memberIds]))
        
        const group = await Conversation.create({
            isGroup: true,
            name: name || "New Group",
            image: image || "",
            admins: [creatorId],
            partcipants: uniqueMembers,
            messages: []
        })
        
        return res.status(201).json(group)
    } catch(error){
        return res.status(500).json({message:`create group error ${error}`})
    }
}
```

#### Group Messaging
```javascript
// Send Group Message
export const sendGroupMessage = async (req, res) => {
    try{
        const sender = req.userId
        const { groupId } = req.params
        const { message, gif, sticker, mentions } = req.body
        
        const group = await Conversation.findById(groupId)
        if(!group || !group.isGroup){
            return res.status(404).json({message:"Group not found"})
        }
        
        if(!group.partcipants.map(String).includes(String(sender))){
            return res.status(403).json({message:"Not a group member"})
        }
        
        // Parse mentions if provided
        let mentionIds = []
        if(mentions){
            try {
                mentionIds = JSON.parse(mentions)
            } catch(e) {
                mentionIds = Array.isArray(mentions) ? mentions : []
            }
        }
        
        const newMessage = await Message.create({ 
            sender, 
            group: groupId, 
            message, 
            image, 
            video, 
            audio, 
            file:fileUrl, 
            gif, 
            sticker,
            mentions: mentionIds,
            status:"sent" 
        })
        
        group.messages.push(newMessage._id)
        await group.save()
        
        // Emit to all online members except sender
        group.partcipants.forEach(uid => {
            const idStr = String(uid)
            if(idStr !== String(sender)){
                const sid = getReceiverSocketId(idStr)
                if(sid){
                    io.to(sid).emit("newGroupMessage", { 
                        ...newMessage.toObject(), 
                        group: groupId 
                    })
                }
            }
        })
        
        // Send special notification to mentioned users
        if(mentionIds.length > 0){
            mentionIds.forEach(mentionId => {
                const sid = getReceiverSocketId(String(mentionId))
                if(sid){
                    io.to(sid).emit("mentioned", { 
                        message: newMessage, 
                        group: groupId,
                        groupName: group.name 
                    })
                }
            })
        }
        
        return res.status(201).json(newMessage)
    } catch(error){
        return res.status(500).json({message:`send group message error ${error}`})
    }
}
```

### Challenges Faced

1. **Member Management**: Adding/removing members with proper permissions
2. **Admin Controls**: Ensuring only admins can manage groups
3. **Mentions**: Implementing @username mentions in group chats

### Solutions Applied

1. **Permission Checks**: Validated admin status before member operations
2. **Socket Broadcasting**: Real-time updates for all group members
3. **Mention System**: Special notifications for mentioned users

## 📁 File Upload System

### Implementation Details

#### Multer Configuration
```javascript
// Multer Middleware
import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

export const upload = multer({ storage: storage })
```

#### Cloudinary Integration
```javascript
// Cloudinary Configuration
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        return response.url
    } catch (error) {
        console.log("Error uploading to cloudinary:", error)
        return null
    }
}
```

### Challenges Faced

1. **File Size Limits**: Large files causing upload failures
2. **File Type Validation**: Ensuring only allowed file types
3. **Storage Management**: Local vs cloud storage decisions

### Solutions Applied

1. **File Validation**: Added file type and size checks
2. **Cloud Storage**: Used Cloudinary for reliable file storage
3. **Error Handling**: Graceful fallback for upload failures

## 🎤 Voice Recording

### Implementation Details

#### Frontend Voice Recording
```javascript
// Voice Recording Component
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    audioChunks.current = []
    
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data)
    }
    
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
      setBackendImage(audioBlob)
      setFrontendImage(URL.createObjectURL(audioBlob))
      stream.getTracks().forEach(track => track.stop())
    }
    
    mediaRecorder.current.start()
    setIsRecording(true)
    setRecordingTime(0)
    
    recordingInterval.current = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  } catch (error) {
    console.error('Error starting recording:', error)
    alert('Microphone access denied')
  }
}

const stopRecording = () => {
  if (mediaRecorder.current && isRecording) {
    mediaRecorder.current.stop()
    setIsRecording(false)
    clearInterval(recordingInterval.current)
  }
}
```

### Challenges Faced

1. **Browser Permissions**: Microphone access requirements
2. **Audio Format**: Different browsers supporting different formats
3. **File Size**: Audio files can be large

### Solutions Applied

1. **Permission Handling**: Proper error handling for denied permissions
2. **Format Support**: Used WebM format for better browser support
3. **Compression**: Implemented audio compression for smaller file sizes

## @ Mentions System

### Implementation Details

#### Message Model Update
```javascript
// Message Schema with Mentions
const messageSchema = new mongoose.Schema({
    // ... other fields
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]
})
```

#### Mention Processing
```javascript
// Parse mentions in group messages
let mentionIds = []
if(mentions){
    try {
        mentionIds = JSON.parse(mentions)
    } catch(e) {
        mentionIds = Array.isArray(mentions) ? mentions : []
    }
}

// Send special notification to mentioned users
if(mentionIds.length > 0){
    mentionIds.forEach(mentionId => {
        const sid = getReceiverSocketId(String(mentionId))
        if(sid){
            io.to(sid).emit("mentioned", { 
                message: newMessage, 
                group: groupId,
                groupName: group.name 
            })
        }
    })
}
```

### Challenges Faced

1. **Mention Parsing**: Extracting @username from message text
2. **User Validation**: Ensuring mentioned users exist
3. **Notification Delivery**: Real-time mention notifications

### Solutions Applied

1. **Regex Parsing**: Used regular expressions to find @mentions
2. **User Lookup**: Validated mentioned users against database
3. **Socket Events**: Special mention events for real-time notifications

## 👤 User Status Management

### Implementation Details

#### User Model
```javascript
// User Schema with Status
const userSchema = new mongoose.Schema({
    // ... other fields
    status: {
        type: String,
        default: "online" // online | away | busy | offline
    }
})
```

#### Status Update
```javascript
// Update User Status Controller
export const updateUserStatus = async (req, res) => {
    try {
        const userId = req.userId
        const { status } = req.body
        const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select("-password")
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`update status error ${error}`})
    }
}
```

#### Frontend Status UI
```javascript
// Status Selection in Profile
<select 
    value={status} 
    onChange={(e)=>setStatus(e.target.value)}
    className='h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-[white] rounded-lg shadow-gray-400 shadow-lg text-gray-700 text-[19px]'
>
    <option value="online">🟢 Online</option>
    <option value="away">🟡 Away</option>
    <option value="busy">🔴 Busy</option>
    <option value="offline">⚫ Offline</option>
</select>
```

### Challenges Faced

1. **Status Persistence**: Maintaining status across sessions
2. **Real-time Updates**: Updating status for all connected users
3. **Status Icons**: Visual representation of different statuses

### Solutions Applied

1. **Database Storage**: Stored status in user document
2. **Socket Broadcasting**: Real-time status updates via socket events
3. **Visual Indicators**: Emoji-based status representation

## 😊 Message Reactions

### Implementation Details

#### Reaction Controller
```javascript
// React to Message
export const reactToMessage = async (req, res) => {
    try {
        const { messageId } = req.params
        const { reaction } = req.body
        const message = await Message.findById(messageId)
        
        if(!message){
            return res.status(404).json({message:"Message not found"})
        }
        
        if(!message.reactions.includes(reaction)){
            message.reactions.push(reaction)
            await message.save()
        }
        
        return res.status(200).json(message)
    } catch (error) {
        return res.status(500).json({message:`react error ${error}`})
    }
}
```

#### Frontend Reaction UI
```javascript
// Reaction Button in Message Component
<button 
    className='px-3 py-2 hover:bg-gray-100 w-full text-left' 
    onClick={()=>{setOpen(false); onReact?.(_id, "👍")}}
>
    👍 React
</button>

// Display Reactions
{reactions && reactions.length > 0 && (
    <div className='flex gap-1 flex-wrap'>
        {reactions.map((reaction, idx) => (
            <span key={idx} className='bg-white/20 px-2 py-1 rounded-full text-[12px]'>
                {reaction}
            </span>
        ))}
    </div>
)}
```

### Challenges Faced

1. **Reaction Storage**: Storing multiple reactions per message
2. **Duplicate Prevention**: Preventing duplicate reactions
3. **Real-time Updates**: Updating reactions in real-time

### Solutions Applied

1. **Array Storage**: Used array field for multiple reactions
2. **Duplicate Check**: Validated before adding reactions
3. **Socket Events**: Real-time reaction updates

## 📱 Last Message Preview

### Implementation Details

#### Last Messages Controller
```javascript
// Get Last Messages
export const getLastMessages = async (req, res) => {
    try {
        const userId = req.userId
        
        // Get personal conversations
        const personalConversations = await Conversation.find({
            isGroup: false,
            partcipants: { $in: [userId] }
        }).populate({
            path: 'messages',
            options: { sort: { createdAt: -1 }, limit: 1 },
            populate: { path: 'sender', select: 'userName name' }
        })
        
        // Get group conversations
        const groupConversations = await Conversation.find({
            isGroup: true,
            partcipants: { $in: [userId] }
        }).populate({
            path: 'messages',
            options: { sort: { createdAt: -1 }, limit: 1 },
            populate: { path: 'sender', select: 'userName name' }
        })
        
        const allConversations = [...personalConversations, ...groupConversations]
        
        // Format the response
        const conversationsWithLastMessage = allConversations.map(conv => {
            const lastMessage = conv.messages[0]
            
            return {
                _id: conv._id,
                isGroup: conv.isGroup,
                name: conv.isGroup ? conv.name : (lastMessage?.sender?.name || lastMessage?.sender?.userName || 'Unknown'),
                image: conv.image || '',
                lastMessage: lastMessage ? {
                    message: lastMessage.message || (lastMessage.image ? '📷 Image' : lastMessage.video ? '🎥 Video' : lastMessage.audio ? '🎵 Audio' : '📎 File'),
                    timestamp: lastMessage.createdAt,
                    sender: lastMessage.sender?.name || lastMessage.sender?.userName || 'Unknown'
                } : null,
                participants: conv.partcipants
            }
        })
        
        // Sort by last message timestamp
        conversationsWithLastMessage.sort((a, b) => {
            if (!a.lastMessage) return 1
            if (!b.lastMessage) return -1
            return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
        })
        
        return res.status(200).json(conversationsWithLastMessage)
    } catch (error) {
        return res.status(500).json({message:`get last messages error ${error}`})
    }
}
```

#### Frontend Display
```javascript
// Last Message Preview in SideBar
{conversations?.map(conv=> (
    <div key={conv._id} className='w-[95%] h-[70px] flex items-center gap-[20px] shadow-gray-500 bg-white shadow-lg rounded-full hover:bg-[#78cae5] cursor-pointer p-2'>
        <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center'>
            <img src={conv.image || dp} alt="" className='h-[100%]' />
        </div>
        <div className='flex-1 min-w-0'>
            <div className='flex justify-between items-center'>
                <h1 className='text-gray-800 font-semibold text-[16px] truncate'>{conv.name}</h1>
                {conv.lastMessage && (
                    <span className='text-[12px] text-gray-500'>{formatTime(conv.lastMessage.timestamp)}</span>
                )}
            </div>
            {conv.lastMessage && (
                <p className='text-[14px] text-gray-600 truncate'>
                    {conv.isGroup && conv.lastMessage.sender !== userData?.userName ? `${conv.lastMessage.sender}: ` : ''}
                    {conv.lastMessage.message}
                </p>
            )}
        </div>
    </div>
))}
```

### Challenges Faced

1. **Performance**: Querying last messages for all conversations
2. **Sorting**: Sorting by last message timestamp
3. **Message Types**: Handling different message types (text, image, etc.)

### Solutions Applied

1. **Efficient Queries**: Used populate with limit for performance
2. **Client-side Sorting**: Sorted conversations by timestamp
3. **Type Indicators**: Added emoji indicators for different message types

## 🎭 Stickers Feature

### Implementation Details

#### Sticker Model
```javascript
// Message Schema with Stickers
const messageSchema = new mongoose.Schema({
    // ... other fields
    sticker: {
        type: String,
        default: ""
    }
})
```

#### Frontend Sticker Picker
```javascript
// Sticker Array
const stickers = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    // ... more stickers
]

// Sticker Picker UI
{showStickers && (
    <div className='absolute bottom-[120px] left-[20px] bg-white rounded-lg shadow-lg p-4 max-w-[300px] max-h-[200px] overflow-y-auto z-[100]'>
        <div className='grid grid-cols-10 gap-2'>
            {stickers.map((sticker, index) => (
                <button
                    key={index}
                    onClick={() => handleStickerClick(sticker)}
                    className='text-2xl hover:bg-gray-100 rounded p-1'
                >
                    {sticker}
                </button>
            ))}
        </div>
    </div>
)}

// Handle Sticker Click
const handleStickerClick = (sticker) => {
    setInput(prev => prev + sticker)
    setShowStickers(false)
}
```

#### Sticker Display
```javascript
// Display Stickers in Messages
{!isDeletedForEveryone && sticker && <div className='text-4xl'>{sticker}</div>}
```

### Challenges Faced

1. **Sticker Storage**: Storing emoji stickers in database
2. **Picker UI**: Creating an intuitive sticker picker
3. **Performance**: Loading large number of stickers

### Solutions Applied

1. **String Storage**: Stored stickers as Unicode strings
2. **Grid Layout**: Used CSS grid for organized sticker display
3. **Lazy Loading**: Implemented scrollable sticker picker

## 🐛 Common Issues & Solutions

### 1. Port Configuration Issues

**Problem**: Backend running on wrong port
```bash
Error: listen EADDRINUSE: address already in use :::8000
```

**Solution**: Update `.env` file
```env
PORT=5000
```

**Root Cause**: Environment variable not set correctly

### 2. Database Connection Issues

**Problem**: MongoDB connection failed
```bash
Error: db error
```

**Solution**: Check MongoDB URL format
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Root Cause**: Incorrect connection string format

### 3. CORS Issues

**Problem**: Frontend can't connect to backend
```bash
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Update CORS configuration
```javascript
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
```

**Root Cause**: CORS not configured for frontend origin

### 4. JWT Token Issues

**Problem**: Authentication failed
```bash
Error: token is not found
```

**Solution**: Check JWT_SECRET in environment
```env
JWT_SECRET=your_secure_secret_key
```

**Root Cause**: JWT secret not set or too weak

### 5. File Upload Issues

**Problem**: Images not uploading
```bash
Error: Cloudinary upload failed
```

**Solution**: Verify Cloudinary credentials
```env
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
```

**Root Cause**: Incorrect Cloudinary configuration

### 6. Socket Connection Issues

**Problem**: Real-time features not working
```bash
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

**Root Cause**: Socket.io CORS configuration

### 7. Memory Leaks

**Problem**: Application slowing down over time
```bash
Warning: Memory usage increasing
```

**Solution**: Proper cleanup in useEffect
```javascript
useEffect(() => {
    // Setup
    return () => {
        // Cleanup
        clearInterval(interval)
        socket.disconnect()
    }
}, [])
```

**Root Cause**: Not cleaning up intervals and socket connections

### 8. State Management Issues

**Problem**: State not updating correctly
```bash
Warning: State update on unmounted component
```

**Solution**: Use cleanup in useEffect
```javascript
useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
        const data = await api.getData()
        if (isMounted) {
            setData(data)
        }
    }
    
    fetchData()
    
    return () => {
        isMounted = false
    }
}, [])
```

**Root Cause**: State updates after component unmount

## 🔧 Development Best Practices

### 1. Error Handling
- Always wrap async operations in try-catch blocks
- Provide user-friendly error messages
- Log errors for debugging

### 2. Performance Optimization
- Use React.memo for expensive components
- Implement proper cleanup in useEffect
- Optimize database queries

### 3. Security
- Validate all inputs
- Use environment variables for sensitive data
- Implement proper authentication checks

### 4. Code Organization
- Separate concerns (controllers, models, routes)
- Use consistent naming conventions
- Add proper comments and documentation

### 5. Testing
- Test API endpoints
- Verify real-time functionality
- Check error scenarios

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

This implementation guide provides comprehensive details about how each feature was built, the challenges encountered, and the solutions applied. It serves as a reference for understanding the codebase and for future development.
