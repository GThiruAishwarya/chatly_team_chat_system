import http from "http"
import express from "express"
import { Server } from "socket.io"

let app = express()

const server=http.createServer(app)
const io=new Server(server,{
    cors:{
        origin:"http://localhost:5173"
    }
})
 const userSocketMap ={}
 export const getReceiverSocketId=(receiver)=>{
    return userSocketMap[receiver]
 }
io.on("connection",(socket)=>{
  const userId=socket.handshake.query.userId
  if(userId!=undefined){
    userSocketMap[userId]=socket.id
  }
  io.emit("getOnlineUsers",Object.keys(userSocketMap))

// typing indicators
socket.on("typing", ({ to }) => {
  const receiverSocketId = userSocketMap[to]
  if(receiverSocketId){
    io.to(receiverSocketId).emit("typing", { from: String(userId) })
  }
})

socket.on("stopTyping", ({ to }) => {
  const receiverSocketId = userSocketMap[to]
  if(receiverSocketId){
    io.to(receiverSocketId).emit("stopTyping", { from: String(userId) })
  }
})

socket.on("disconnect",()=>{
  delete userSocketMap[userId]  
 io.emit("getOnlineUsers",Object.keys(userSocketMap))

})
   
})



export {app,server,io}