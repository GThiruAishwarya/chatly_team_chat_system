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
  socket.on("typing", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: String(userId) });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { from: String(userId) });
    }
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
