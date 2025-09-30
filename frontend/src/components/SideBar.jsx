import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import dp from "../assets/dp.webp"
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import { serverUrl } from '../main';
import axios from 'axios';
import { setOtherUsers, setSearchData, setSelectedGroup, setSelectedUser, setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
function SideBar() {
    let {userData,otherUsers,selectedUser,selectedGroup,onlineUsers,searchData,groups} = useSelector(state=>state.user)
    let [showCreateGroup,setShowCreateGroup]=useState(false)
    let [groupName,setGroupName]=useState("")
    let [groupImage,setGroupImage]=useState(null)
    let groupInput=React.useRef()
    let [search,setSearch]=useState(false)
    let [input,setInput]=useState("")
    let [conversations,setConversations]=useState([])
let dispatch=useDispatch()
let navigate=useNavigate()
    const handleLogOut=async ()=>{
        try {
            let result =await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
dispatch(setUserData(null))
dispatch(setOtherUsers(null))
navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    const handlesearch=async ()=>{
        try {
            let result =await axios.get(`${serverUrl}/api/user/search?query=${input}`,{withCredentials:true})
            dispatch(setSearchData(result.data))
           
        }
        catch(error){
console.log(error)
        }
    }

    useEffect(()=>{
        if(input){
            handlesearch()
        }

    },[input])

    // Load conversations with last messages
    useEffect(() => {
        const loadConversations = async () => {
            if(!userData) return
            try {
                const res = await axios.get(`${serverUrl}/api/message/last-messages`, {withCredentials:true})
                setConversations(res.data)
            } catch(e) {
                console.log(e)
            }
        }
        loadConversations()
    }, [userData])

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date
        
        if (diff < 60000) return 'now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
        return date.toLocaleDateString()
    }
  return (
    <div className={`lg:w-[30%] w-full h-full overflow-hidden lg:block bg-slate-200 relative ${!selectedUser?"block":"hidden"} fade-in`}>
        <div className='w-[60px] h-[60px] mt-[10px] rounded-full overflow-hidden flex justify-center items-center bg-[#20c7ff] shadow-gray-500 text-gray-700 cursor-pointer shadow-lg fixed bottom-[20px] left-[10px] hover-scale' onClick={handleLogOut}>
   <BiLogOutCircle className='w-[25px] h-[25px]'/>
</div>
{input.length>0 && <div className='flex absolute top-[250px] bg-[white] w-full h-[500px] overflow-y-auto items-center pt-[20px] flex-col gap-[10px] z-[150] shadow-lg'>
{searchData?.map((user)=>(
     <div className='w-[95%] h-[70px] flex items-center gap-[20px]  px-[10px] hover:bg-[#78cae5] border-b-2 border-gray-400 cursor-pointer' onClick={()=>{
        dispatch(setSelectedUser(user))
        setInput("")
        setSearch(false)
     }
        }>
     <div className='relative rounded-full bg-white  flex justify-center items-center '>
     <div className='w-[60px] h-[60px]   rounded-full overflow-hidden flex justify-center items-center '>
     <img src={user.image || dp} alt="" className='h-[100%]'/>
     </div>
     {onlineUsers?.includes(user._id) &&
     <span className='w-[12px] h-[12px] rounded-full absolute bottom-[6px] right-[-1px] bg-[#3aff20] shadow-gray-500 shadow-md'></span>}
     </div>
     <h1 className='text-gray-800 font-semibold text-[20px]'>{user.name || user.userName}</h1>
     </div>
))}
        </div> }

      <div className='w-full h-[300px] bg-gradient-to-br from-[#20c7ff] to-[#1797c2] rounded-b-[30%] shadow-gray-400 shadow-lg flex flex-col justify-center px-[20px] slide-down'>
    <h1 className='text-white font-extrabold text-[28px] tracking-wide'>chatly</h1>
   <div className='w-full flex justify-between items-center'>
    <h1 className='text-gray-800 font-bold text-[25px]'>Hii , {userData.name || "user"}</h1>
    <div className='w-[60px] h-[60px] rounded-full overflow-hidden flex justify-center items-center bg-white cursor-pointer shadow-gray-500 shadow-lg hover-raise' onClick={()=>navigate("/profile")}>
<img src={userData.image || dp} alt="" className='h-[100%]'/>
</div>
   </div>
   <div className='w-full  flex items-center gap-[20px] overflow-y-auto py-[18px]'>
    {!search && <div className='w-[60px] h-[60px] mt-[10px] rounded-full overflow-hidden flex justify-center items-center bg-white shadow-gray-500 cursor-pointer shadow-lg hover-scale' onClick={()=>setSearch(true)}>
   <IoIosSearch className='w-[25px] h-[25px]'/>
</div>}

{search && 
    <form className='w-full h-[60px] bg-white shadow-gray-500 shadow-lg flex items-center gap-[10px] mt-[10px] rounded-full overflow-hidden px-[20px] relative pop-in'>
    <IoIosSearch className='w-[25px] h-[25px]'/>
    <input type="text" placeholder='search users...' className='w-full h-full p-[10px] text-[17px] outline-none border-0 ' onChange={(e)=>setInput(e.target.value)} value={input}/>
    <RxCross2 className='w-[25px] h-[25px] cursor-pointer' onClick={()=>setSearch(false)}/>
     
    </form>
    }
{!search && otherUsers?.map((user)=>(
    onlineUsers?.includes(user._id) &&
    <div className='relative rounded-full shadow-gray-500 bg-white shadow-lg flex justify-center items-center mt-[10px] cursor-pointer hover-scale' onClick={()=>dispatch(setSelectedUser(user))}>
    <div className='w-[60px] h-[60px]   rounded-full overflow-hidden flex justify-center items-center '>
    <img src={user.image || dp} alt="" className='h-[100%]'/>
    </div>
    <span className='w-[12px] h-[12px] rounded-full absolute bottom-[6px] right-[-1px] bg-[#3aff20] shadow-gray-500 shadow-md'></span>
    </div>
))}
 
   </div>
      </div>

      <div className='w-full h-[50%] overflow-auto flex flex-col gap-[20px] items-center mt-[20px]'>
      <div className='w-[95%] flex justify-between items-center slide-down'>
        <h2 className='text-gray-700 font-semibold'>Conversations</h2>
        <button className='text-sm bg-[#20c7ff] text-white px-3 py-1 rounded-full shadow' onClick={()=>setShowCreateGroup(true)}>New Group</button>
      </div>
      
      {/* Conversations with last message preview */}
      {conversations?.map(conv=> (
        <div 
          key={conv._id}
          className='w-[95%] h-[70px] flex items-center gap-[20px] shadow-gray-500 bg-white shadow-lg rounded-full hover:bg-[#78cae5] cursor-pointer p-2 fade-in'
          onClick={()=>{
            if(conv.isGroup) {
              dispatch(setSelectedGroup(conv)); 
              dispatch(setSelectedUser(null))
            } else {
              // Find the other participant for personal chat
              const otherUser = otherUsers?.find(u => conv.participants.includes(u._id))
              if(otherUser) {
                dispatch(setSelectedUser(otherUser))
                dispatch(setSelectedGroup(null))
              }
            }
          }}
        >
          <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center hover-scale'>
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
{otherUsers?.map((user)=>(
    <div className='w-[95%] h-[60px] flex items-center gap-[20px] shadow-gray-500 bg-white shadow-lg rounded-full hover:bg-[#78cae5] cursor-pointer' onClick={()=>dispatch(setSelectedUser(user))}>
    <div className='relative rounded-full shadow-gray-500 bg-white shadow-lg flex justify-center items-center mt-[10px]'>
    <div className='w-[60px] h-[60px]   rounded-full overflow-hidden flex justify-center items-center '>
    <img src={user.image || dp} alt="" className='h-[100%]'/>
    </div>
    {showCreateGroup && (
      <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-[500]' onClick={()=>setShowCreateGroup(false)}>
        <form className='bg-white rounded-xl p-4 w-[90%] max-w-[420px] flex flex-col gap-3 shadow-lg' onClick={(e)=>e.stopPropagation()} onSubmit={async (e)=>{
          e.preventDefault()
          try{
            const fd = new FormData()
            fd.append("name", groupName)
            if(groupImage){ fd.append("image", groupImage) }
            // for now create group with only creator, you can extend to select members
            fd.append("members", JSON.stringify([]))
            const res = await axios.post(`${serverUrl}/api/group/create`, fd, {withCredentials:true})
            setShowCreateGroup(false)
            setGroupName("")
            setGroupImage(null)
            // refresh groups
            const list = await axios.get(`${serverUrl}/api/group/list`, {withCredentials:true})
            dispatch(setGroups(list.data))
          }catch(err){ console.log(err) }
        }}>
          <h3 className='text-lg font-semibold text-gray-800'>Create Group</h3>
          <input className='border p-2 rounded' placeholder='Group name' value={groupName} onChange={e=>setGroupName(e.target.value)} />
          <input type='file' ref={groupInput} hidden accept='image/*' onChange={(e)=> setGroupImage(e.target.files[0])} />
          <button type='button' className='border rounded p-2' onClick={()=>groupInput.current.click()}>Upload Image</button>
          <div className='flex gap-2 justify-end'>
            <button type='button' className='px-3 py-1' onClick={()=>setShowCreateGroup(false)}>Cancel</button>
            <button className='bg-[#20c7ff] text-white px-3 py-1 rounded'>Create</button>
          </div>
        </form>
      </div>
    )}
    {onlineUsers?.includes(user._id) &&
    <span className='w-[12px] h-[12px] rounded-full absolute bottom-[6px] right-[-1px] bg-[#3aff20] shadow-gray-500 shadow-md'></span>}
    </div>
    <h1 className='text-gray-800 font-semibold text-[20px]'>{user.name || user.userName}</h1>
    </div>
))}
      </div>
    </div>
  )
}

export default SideBar