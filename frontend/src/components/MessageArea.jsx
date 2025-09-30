import React, { useEffect, useRef, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import dp from "../assets/dp.webp"
import { useDispatch, useSelector } from 'react-redux';
import { setGroups, setSelectedGroup, setSelectedUser } from '../redux/userSlice';
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { FaPaperclip } from "react-icons/fa";
import { RiSendPlane2Fill } from "react-icons/ri";
import { FaMicrophone, FaStop } from "react-icons/fa";
import EmojiPicker from 'emoji-picker-react';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import axios from 'axios';
import { serverUrl } from '../main';
import { setMessages } from '../redux/messageSlice';
function MessageArea() {
  let {selectedUser,selectedGroup,userData,socket,onlineUsers,otherUsers}=useSelector(state=>state.user)
  let dispatch=useDispatch()
  let [showPicker,setShowPicker]=useState(false)
let [input,setInput]=useState("")
let [frontendImage,setFrontendImage]=useState(null)
let [backendImage,setBackendImage]=useState(null)
let image=useRef()
let attachment=useRef()
let {messages}=useSelector(state=>state.message)
let [isTyping,setIsTyping]=useState(false)
let typingTimeout=useRef(null)
let [showManage,setShowManage]=useState(false)
let [gifUrl,setGifUrl]=useState("")
let [replyTo,setReplyTo]=useState(null)
let [showStickers,setShowStickers]=useState(false)
let [isRecording,setIsRecording]=useState(false)
let [recordingTime,setRecordingTime]=useState(0)
let mediaRecorder=useRef(null)
let audioChunks=useRef([])
let recordingInterval=useRef(null)
const handleImage=(e)=>{
  let file=e.target.files[0]
  setBackendImage(file)
  setFrontendImage(URL.createObjectURL(file))
}

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

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const stickers = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
  '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
  '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'
]

const handleStickerClick = (sticker) => {
  setInput(prev => prev + sticker)
  setShowStickers(false)
}
const handleSendMessage=async (e)=>{
  e.preventDefault()
  if(input.length==0 && backendImage==null){
    return 
  }
  try {
    let formData=new FormData()
    formData.append("message",input)
    if(backendImage){
      // Check if it's an audio file
      if(backendImage.type && backendImage.type.startsWith('audio/')){
        formData.append("audio",backendImage)
      } else {
        formData.append("image",backendImage)
      }
    }
    if(replyTo){
      formData.append("replyTo", replyTo._id)
    }
    let result
    if(selectedUser){
      result=await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`,formData,{withCredentials:true})
    }else if(selectedGroup){
      if(backendImage){
        formData.delete("image")
        formData.append("attachment", backendImage)
      }
      if(gifUrl){
        formData.append("gif", gifUrl)
      }
      result=await axios.post(`${serverUrl}/api/group/send/${selectedGroup._id}`,formData,{withCredentials:true})
    }
    dispatch(setMessages([...messages,result.data]))
    setInput("")
    setFrontendImage(null)
    setBackendImage(null)
    setGifUrl("")
    setReplyTo(null)
  } catch (error) {
    console.log(error)
  }
}
const handleDeleteForMe = async (messageId)=>{
  try{
    await axios.delete(`${serverUrl}/api/message/delete/me/${messageId}`,{withCredentials:true})
    // hide this message for current user
    const updated = messages.filter(m=>m._id!==messageId)
    dispatch(setMessages(updated))
  }catch(err){
    console.log(err)
  }
}
const handleDeleteForEveryone = async (messageId)=>{
  try{
    await axios.delete(`${serverUrl}/api/message/delete/everyone/${messageId}`,{withCredentials:true})
    const updated = messages.map(m=> m._id===messageId ? {...m, isDeletedForEveryone:true, message:"", image:""} : m)
    dispatch(setMessages(updated))
  }catch(err){
    console.log(err)
  }
}
const handleReact = async (messageId, reaction) => {
  try{
    await axios.post(`${serverUrl}/api/message/react/${messageId}`, {reaction}, {withCredentials:true})
    const updated = messages.map(m=> m._id===messageId ? {...m, reactions: [...(m.reactions||[]), reaction]} : m)
    dispatch(setMessages(updated))
  }catch(err){
    console.log(err)
  }
}
  const onEmojiClick =(emojiData)=>{
 setInput(prevInput=>prevInput+emojiData.emoji)
 setShowPicker(false)
  }
useEffect(()=>{
socket?.on("newMessage",(mess)=>{
  dispatch(setMessages([...(messages||[]),mess]))
})
socket?.on("newGroupMessage",(mess)=>{
  // update only if in this group view
  if(selectedGroup && String(mess.group)===String(selectedGroup._id)){
    dispatch(setMessages([...(messages||[]),mess]))
  }
})
socket?.on("messageDeleted",({messageId})=>{
  const updated = (messages||[]).map(m=> m._id===messageId ? {...m, isDeletedForEveryone:true, message:"", image:""} : m)
  dispatch(setMessages(updated))
})
socket?.on("messageStatus",({messageId,status})=>{
  const updated = (messages||[]).map(m=> m._id===messageId ? {...m, status} : m)
  dispatch(setMessages(updated))
})
socket?.on("typing", ({from})=>{
  if(from===selectedUser?._id){
    setIsTyping(true)
  }
})
socket?.on("stopTyping", ({from})=>{
  if(from===selectedUser?._id){
    setIsTyping(false)
  }
})
return ()=>{
  socket?.off("newMessage")
  socket?.off("messageDeleted")
  socket?.off("messageStatus")
  socket?.off("typing")
  socket?.off("stopTyping")
  socket?.off("newGroupMessage")
}
},[messages,setMessages,selectedGroup])
 
  return (
    <div className={`lg:w-[70%] relative   ${(selectedUser||selectedGroup)?"flex":"hidden"} lg:flex  w-full h-full bg-slate-200 border-l-2 border-gray-300 overflow-hidden`}>
      
{(selectedUser || selectedGroup) && 
<div className='w-full h-[100vh] flex flex-col overflow-hidden gap-[20px] items-center'>
<div className='w-full h-[100px] bg-[#1797c2] rounded-b-[30px] shadow-gray-400 shadow-lg gap-[20px] flex items-center px-[20px] '>
            <div className='cursor-pointer' onClick={()=>{dispatch(setSelectedUser(null)); dispatch(setSelectedGroup(null))}}>
                  <IoIosArrowRoundBack className='w-[40px] h-[40px] text-white'/>
           </div>
        <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center bg-white cursor-pointer shadow-gray-500 shadow-lg' >
       <img src={(selectedUser?.image) || (selectedGroup?.image) || dp} alt="" className='h-[100%]'/>
       </div>
       <div className='flex flex-col'>
         <h1 className='text-white font-semibold text-[20px]'>{selectedUser?.name || selectedGroup?.name || "user"}</h1>
         {selectedUser && (isTyping ? <span className='text-white text-[12px] opacity-80'>typing...</span> : (
           <span className='text-white text-[12px] opacity-80'>{onlineUsers?.includes(selectedUser._id)?"Online":"Offline"}</span>
         ))}
       </div>
        {selectedGroup && selectedGroup.admins?.includes(userData?._id) && (
        <button className='ml-auto text-sm bg-white/20 text-white px-3 py-1 rounded-full' onClick={()=>setShowManage(true)}>Manage</button>
       )}
    </div>
    {replyTo && (
      <div className='bg-white/20 rounded p-2 mx-4 mb-2 text-[14px] border-l-2 border-white/40'>
        <span className='opacity-70'>Replying to:</span>
        <div className='truncate'>{replyTo.message || "Media message"}</div>
        <button className='text-red-400 text-[12px]' onClick={()=>setReplyTo(null)}>Cancel</button>
      </div>
    )}

    <div className='w-full h-[70%] flex flex-col py-[30px]  px-[20px] overflow-auto gap-[20px] '>

{showPicker && <div className='absolute bottom-[120px] left-[20px]'><EmojiPicker width={250} height={350} className='shadow-lg z-[100]' onEmojiClick={onEmojiClick}/></div> }

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

{messages && messages.map((mess)=>(
  mess.sender==userData._id?
  <SenderMessage _id={mess._id} image={mess.image} video={mess.video} audio={mess.audio} file={mess.file} gif={mess.gif} sticker={mess.sticker} message={mess.message} status={mess.status} isDeletedForEveryone={mess.isDeletedForEveryone} onDeleteForMe={handleDeleteForMe} onDeleteForEveryone={handleDeleteForEveryone} replyTo={mess.replyTo} reactions={mess.reactions} onReact={handleReact} onReply={setReplyTo}/>:
  <ReceiverMessage _id={mess._id} image={mess.image} video={mess.video} audio={mess.audio} file={mess.file} gif={mess.gif} sticker={mess.sticker} message={mess.message} isDeletedForEveryone={mess.isDeletedForEveryone} onDeleteForMe={handleDeleteForMe} replyTo={mess.replyTo} reactions={mess.reactions} onReact={handleReact} onReply={setReplyTo}/>
))}
 

    </div>
    </div> 
    }
{(selectedUser || selectedGroup) && <div className='w-full lg:w-[70%] h-[100px] fixed bottom-[20px] flex items-center justify-center '>
      <img src={frontendImage} alt="" className='w-[80px] absolute bottom-[100px] right-[20%] rounded-lg shadow-gray-400 shadow-lg'/>
     <form className='w-[95%] lg:w-[70%] h-[60px] bg-[rgb(23,151,194)] shadow-gray-400 shadow-lg rounded-full flex items-center gap-[20px] px-[20px] relative' onSubmit={handleSendMessage}>
      
       <div onClick={()=>setShowPicker(prev=>!prev)}>
       <RiEmojiStickerLine  className='w-[25px] h-[25px] text-white cursor-pointer'/>
       </div>
       <div onClick={()=>setShowStickers(prev=>!prev)}>
       <span className='text-white text-[20px] cursor-pointer'>😀</span>
       </div>
       <input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" ref={image} hidden onChange={handleImage}/>
       <input type="text" className='w-full h-full px-[10px] outline-none border-0 text-[19px] text-white bg-transparent placeholder-white' placeholder='Message' onChange={(e)=>{
        setInput(e.target.value)
        if(selectedUser && socket){
          socket.emit("typing", { to: selectedUser._id })
          if(typingTimeout.current){
            clearTimeout(typingTimeout.current)
          }
          typingTimeout.current = setTimeout(()=>{
            socket.emit("stopTyping", { to: selectedUser._id })
          }, 1000)
        }
       }} value={input}/>
<div onClick={()=>image.current.click()}>
<FaImages className='w-[25px] h-[25px] cursor-pointer text-white'/>
</div>

{/* Voice Recording Button */}
<div className='flex items-center gap-2'>
  {!isRecording ? (
    <div onClick={startRecording} className='cursor-pointer'>
      <FaMicrophone className='w-[25px] h-[25px] text-white'/>
    </div>
  ) : (
    <div className='flex items-center gap-2'>
      <div onClick={stopRecording} className='cursor-pointer'>
        <FaStop className='w-[25px] h-[25px] text-red-400'/>
      </div>
      <span className='text-white text-[14px]'>{formatTime(recordingTime)}</span>
    </div>
  )}
</div>

{selectedGroup && (
  <input value={gifUrl} onChange={(e)=>setGifUrl(e.target.value)} placeholder='GIF url (optional)' className='text-white placeholder-white/70 bg-transparent border-b border-white/40 outline-none text-[14px] w-[180px]' />
)}
{(input.length>0  ||  backendImage!=null) && (<button>
<RiSendPlane2Fill className='w-[25px] cursor-pointer h-[25px] text-white'/>
</button>)}

     </form>
    </div>}
    {(!selectedUser && !selectedGroup) && 
    <div className='w-full h-full flex flex-col justify-center items-center'>
    <h1 className='text-gray-700 font-bold text-[50px]'>Welcome to Chatly</h1>
    <span className='text-gray-700 font-semibold text-[30px]'>Chat Friendly !</span>
      </div>}
    


    {showManage && selectedGroup && (
      <div className='absolute inset-0 bg-black/30 flex items-center justify-center z-[200]'>
        <div className='bg-white rounded-xl p-4 w-[95%] max-w-[520px] flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800'>Manage members</h3>
            <button onClick={()=>setShowManage(false)} className='text-gray-600'>Close</button>
          </div>
          <div className='max-h-[220px] overflow-auto flex flex-col gap-2'>
            {otherUsers?.filter(u=>selectedGroup.partcipants?.includes(u._id)).map(u=> (
              <div className='flex items-center justify-between border rounded p-2'>
                <div className='flex items-center gap-2'>
                  <img src={u.image || dp} className='w-[32px] h-[32px] rounded-full'/>
                  <span>{u.name || u.userName}</span>
                </div>
                {selectedGroup.admins?.includes(userData?._id) && userData?._id!==u._id && (
                  <button className='text-red-600' onClick={async ()=>{
                    try{
                      const res = await axios.post(`${serverUrl}/api/group/remove/${selectedGroup._id}`, {memberId:u._id}, {withCredentials:true})
                      dispatch(setSelectedGroup(res.data))
                    }catch(err){console.log(err)}
                  }}>Remove</button>
                )}
              </div>
            ))}
          </div>
          <div className='pt-2 border-t'>
            <span className='text-sm text-gray-600'>Add member</span>
            <div className='max-h-[160px] overflow-auto flex flex-col gap-2 mt-2'>
              {otherUsers?.filter(u=>!selectedGroup.partcipants?.includes(u._id)).map(u=> (
                <div className='flex items-center justify-between border rounded p-2'>
                  <div className='flex items-center gap-2'>
                    <img src={u.image || dp} className='w-[28px] h-[28px] rounded-full'/>
                    <span>{u.name || u.userName}</span>
                  </div>
                  <button className='text-[#1797c2]' onClick={async ()=>{
                    try{
                      const res = await axios.post(`${serverUrl}/api/group/add/${selectedGroup._id}`, {memberId:u._id}, {withCredentials:true})
                      dispatch(setSelectedGroup(res.data))
                    }catch(err){console.log(err)}
                  }}>Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

export default MessageArea