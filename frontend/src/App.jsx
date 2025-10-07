import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import getCurrentUser from './customHooks/getCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import Profile from './pages/Profile'
import getOtherUsers from './customHooks/getOtherUsers'
import {io} from "socket.io-client"
import { serverUrl } from './main'
import { setOnlineUsers, setSocket, setSelectedUser, setSelectedGroup } from './redux/userSlice'

function App() {
  getCurrentUser()
  getOtherUsers()
  let {userData,socket,onlineUsers,otherUsers,groups}=useSelector(state=>state.user)
  let dispatch=useDispatch()

  useEffect(()=>{
    if(typeof Notification !== 'undefined' && Notification.permission === 'default'){
      Notification.requestPermission().catch(()=>{})
    }
    if(userData){
      const socketio=io(`${serverUrl}`,{
        query:{
          userId:userData?._id
        }
        })
        dispatch(setSocket(socketio))
        
        socketio.on("getOnlineUsers",(users)=>{
          dispatch(setOnlineUsers(users))
        })
        // Global WhatsApp-style push notifications
        socketio.on("newMessage", (mess) => {
          if (Notification?.permission !== "granted") {
            Notification.requestPermission();
            return;
          }

          const isChatPage = window.location.pathname === '/';
          const isSameChat = mess.sender === userData?._id || mess.receiver === userData?._id;

          // Show notification if tab is hidden OR not on chat page OR not in same chat
          if (document.hidden || !isChatPage || !isSameChat) {
            const senderName = mess.senderName || mess.sender?.name || mess.sender?.userName || "Someone";

            const notification = new Notification(`💬 ${senderName} sent you a message`, {
              body: mess.message || "New attachment",
              icon: "/logo.png",
            });

            notification.onclick = () => {
              window.focus();
              // Navigate to the chat with the sender
              if (mess.sender && mess.sender !== userData?._id) {
                const senderUser = otherUsers?.find(u => u._id === mess.sender);
                if (senderUser) {
                  dispatch(setSelectedUser(senderUser));
                  dispatch(setSelectedGroup(null));
                }
              }
            };
          }
        });
        socketio.on("newGroupMessage", (mess) => {
          if (Notification?.permission !== "granted") {
            Notification.requestPermission();
            return;
          }

          const isChatPage = window.location.pathname === '/';
          const isSameGroup = mess.group && mess.group === mess.group;

          // Show notification if tab is hidden OR not on chat page OR not in same group
          if (document.hidden || !isChatPage || !isSameGroup) {
            const senderName = mess.senderName || mess.sender?.name || mess.sender?.userName || "Someone";

            const notification = new Notification(`💬 ${senderName} sent a group message`, {
              body: mess.message || "New attachment",
              icon: "/logo.png",
            });

            notification.onclick = () => {
              window.focus();
              // Navigate to the group chat
              if (mess.group) {
                const group = groups?.find(g => g._id === mess.group);
                if (group) {
                  dispatch(setSelectedGroup(group));
                  dispatch(setSelectedUser(null));
                }
              }
            };
          }
        });
        
        return ()=>socketio.close()
        
    }else{
      if(socket){
        socket.close()
        dispatch(setSocket(null))
      }
    }


  },[userData])

  return (
    <Routes>
      <Route path='/login' element={!userData?<Login/>:<Navigate to="/"/>}/>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to="/profile"/>}/>
      <Route path='/' element={userData?<Home/>:<Navigate to="/login"/>}/>
      <Route path='/profile' element={userData?<Profile/>:<Navigate to="/signup"/>}/>
    </Routes>
  )
}

export default App
