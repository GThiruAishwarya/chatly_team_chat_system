import http from "http";
import express from "express";
import { Server } from "socket.io";
import User from "../models/user.model.js";

let app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // local frontend
      "https://chatly-team-chat-system-frontend.onrender.com", // deployed frontend
    ],
    credentials: true,
  },
});

// map of online users: userId -> socketId
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

  // typing indicators
  socket.on("typing", ({ to, senderName }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: String(userId), senderName });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { from: String(userId) });
    }
  });

  // group typing indicators
  socket.on("groupTyping", ({ groupId, senderName }) => {
    // Broadcast to all online users (in a real app, you'd filter by group members)
    io.emit("groupTyping", { from: String(userId), groupId, senderName });
  });

  socket.on("stopGroupTyping", ({ groupId }) => {
    // Broadcast to all online users (in a real app, you'd filter by group members)
    io.emit("stopGroupTyping", { from: String(userId), groupId });
  });

  // disconnect
  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    (async ()=>{
      try{
        if(userId){
          await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() })
        }
      }catch(e){}
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })()
  });
});

export { app, server, io };
