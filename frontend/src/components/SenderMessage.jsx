import React, { useEffect, useRef, useState } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'
import { RiMore2Fill } from "react-icons/ri"
function SenderMessage({image,video,audio,file,gif,sticker,message,_id,onDeleteForMe,onDeleteForEveryone,isDeletedForEveryone,status,replyTo,reactions,onReact,onReply,createdAt}) {
  let scroll = useRef()
  let {userData}=useSelector(state=>state.user)
  let [open,setOpen]=useState(false)
  useEffect(()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  },[message,image])
  const handleImageScroll=()=>{
    scroll?.current.scrollIntoView({behavior:"smooth"})
  }
  const formatTime = (ts)=>{
    if(!ts) return "";
    const d = new Date(ts)
    return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
  }
  const renderTicks = ()=>{
    if(status==="read") return <span className='text-sky-300'>✓✓</span>
    if(status==="delivered") return <span className='text-white/80'>✓✓</span>
    return <span className='text-white/80'>✓</span>
  }
  const renderTicksPlain = ()=>{
    if(status==="read") return "✓✓"
    if(status==="delivered") return "✓✓"
    return "✓"
  }
  return (
    <div className='flex items-start gap-[10px] fade-in' >
     
      <div ref={scroll} className='w-fit max-w-[500px] px-[20px] py-[10px]  bg-[rgb(23,151,194)] text-white text-[19px] rounded-tr-none rounded-2xl relative right-0 ml-auto shadow-gray-400 shadow-lg gap-[10px] flex flex-col pop-in'>
    {replyTo && (
      <div className='bg-white/20 rounded p-2 text-[14px] border-l-2 border-white/40'>
        <span className='opacity-70'>Replying to:</span>
        <div className='truncate'>{replyTo.message || "Media message"}</div>
      </div>
    )}
    {!isDeletedForEveryone && image &&  <img src={image} alt="" className='w-[150px] rounded-lg' onLoad={handleImageScroll}/>}
    {!isDeletedForEveryone && video && <video src={video} controls className='w-[220px] rounded-lg' onLoadedData={handleImageScroll}/>} 
    {!isDeletedForEveryone && audio && <audio src={audio} controls className='w-[220px]'/>}
    {!isDeletedForEveryone && gif &&  <img src={gif} alt="gif" className='w-[150px] rounded-lg' onLoad={handleImageScroll}/>}
    {!isDeletedForEveryone && sticker && <div className='text-4xl'>{sticker}</div>}
    {!isDeletedForEveryone && file && <a href={file} target='_blank' rel='noreferrer' className='underline text-[14px] break-all'>Attachment</a>}
   {!isDeletedForEveryone && message && <span >{message}</span>}
   {isDeletedForEveryone && <span className='italic opacity-70'>Message deleted</span>}
   {reactions && reactions.length > 0 && (
     <div className='flex gap-1 flex-wrap'>
       {reactions.map((reaction, idx) => (
         <span key={idx} className='bg-white/20 px-2 py-1 rounded-full text-[12px]'>{reaction}</span>
       ))}
     </div>
   )}
   {!isDeletedForEveryone && (
    <div className='text-[11px] opacity-90 self-end flex items-center gap-1'>
      <span>{formatTime(createdAt)}</span>
      {renderTicks()}
    </div>
   )}
   <div className='absolute -top-2 -left-8'>
     <RiMore2Fill className='text-gray-600 cursor-pointer hover-scale' onClick={()=>setOpen(prev=>!prev)} />
     {open && (
      <div className='bg-white text-gray-800 rounded shadow-md text-[14px] pop-in min-w-[180px]'>
        <div className='px-3 py-2 text-[12px] text-gray-600 border-b'>
          <div className='flex items-center gap-1'>
            <span>{formatTime(createdAt)}</span>
            <span className={`${status==='read'?'text-sky-500':'text-gray-500'}`}>{renderTicksPlain()}</span>
          </div>
          <div className='capitalize'>{status || 'sent'}</div>
        </div>
        <button className='px-3 py-2 hover:bg-gray-100 w-full text-left' onClick={()=>{setOpen(false); onReply?.({_id, message, image, video, audio, file, gif})}}>Reply</button>
        <button className='px-3 py-2 hover:bg-gray-100 w-full text-left' onClick={()=>{setOpen(false); onReact?.(_id, "👍")}}>👍 React</button>
        <button className='px-3 py-2 hover:bg-gray-100 w-full text-left' onClick={()=>{setOpen(false); onDeleteForMe?.(_id)}}>Delete for me</button>
        <button className='px-3 py-2 hover:bg-gray-100 w-full text-left' onClick={()=>{setOpen(false); onDeleteForEveryone?.(_id)}}>Delete for everyone</button>
      </div>
     )}
   </div>
   </div>
   <div className='w-[40px] h-[40px] rounded-full overflow-hidden flex justify-center items-center bg-white cursor-pointer shadow-gray-500 shadow-lg hover-scale ' >
     <img src={userData.image || dp} alt="" className='h-[100%]'/>
     </div>
    </div>
  )
}

export default SenderMessage
