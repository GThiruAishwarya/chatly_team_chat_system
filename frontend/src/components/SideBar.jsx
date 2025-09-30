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
import CreateGroupModal from './CreateGroupModal';
function SideBar() {
    let {userData,otherUsers,selectedUser,selectedGroup,onlineUsers,searchData,groups} = useSelector(state=>state.user)
    let [showCreateGroup,setShowCreateGroup]=useState(false)
    let [activeTab,setActiveTab]=useState('chats') // chats | groups | settings
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
    <div className={`lg:w-[30%] w-full h-full overflow-hidden lg:block bg-slate-100 relative ${!selectedUser?"block":"hidden"} fade-in`}>
        <div className='w-[60px] h-[60px] mt-[10px] rounded-full overflow-hidden flex justify-center items-center bg-[#20c7ff] shadow-gray-500 text-gray-700 cursor-pointer shadow-lg fixed bottom-[20px] left-[10px] hover-scale' onClick={handleLogOut}>
   <BiLogOutCircle className='w-[25px] h-[25px]'/>
</div>
{input.length>0 && <div className='flex absolute top-[250px] bg-[white] w-full h-[500px] overflow-y-auto items-center pt-[20px] flex-col gap-[10px] z-[150] shadow-lg'>
{searchData?.map((user)=>(
     <div className='w-[95%] h-[70px] flex items-center gap-[20px]  px-[10px] hover:bg-violet-100 border-b-2 border-gray-200 cursor-pointer' onClick={()=>{
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

      <div className='w-full h-[300px] bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-b-[30%] shadow-gray-400 shadow-lg flex flex-col justify-center px-[20px] slide-down'>
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
      {/* Tabs */}
      <div className='px-[16px] mt-3'>
        <div className='bg-white/70 rounded-full p-1 flex gap-1 shadow-md'>
          <button className={`flex-1 text-sm px-3 py-2 rounded-full ${activeTab==='chats'?'bg-white text-[#1797c2] font-semibold':'text-gray-600'}`} onClick={()=>setActiveTab('chats')}>Chats</button>
          <button className={`flex-1 text-sm px-3 py-2 rounded-full ${activeTab==='groups'?'bg-white text-[#1797c2] font-semibold':'text-gray-600'}`} onClick={()=>setActiveTab('groups')}>Groups</button>
          <button className={`flex-1 text-sm px-3 py-2 rounded-full ${activeTab==='settings'?'bg-white text-[#1797c2] font-semibold':'text-gray-600'}`} onClick={()=>setActiveTab('settings')}>Settings</button>
        </div>
      </div>
      </div>

      <div className='w-full h-[50%] overflow-auto flex flex-col gap-[12px] items-center mt-[16px]'>
        {activeTab==='chats' && (
          <>
            <div className='w-[95%] flex justify-between items-center slide-down'>
              <h2 className='text-gray-700 font-semibold'>Conversations</h2>
            </div>
            {conversations?.map(conv=> (
              <div 
                key={conv._id}
                className='w-[95%] h-[70px] flex items-center gap-[20px] shadow-gray-500 bg-white shadow-lg rounded-full hover:bg-violet-100 cursor-pointer p-2 fade-in'
                onClick={()=>{
                  if(conv.isGroup) {
                    dispatch(setSelectedGroup(conv)); 
                    dispatch(setSelectedUser(null))
                  } else {
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
              <div className='w-[95%] h-[60px] flex items-center gap-[20px] shadow-gray-500 bg-white shadow-lg rounded-full hover:bg-violet-100 cursor-pointer' onClick={()=>dispatch(setSelectedUser(user))}>
                <div className='relative rounded-full shadow-gray-500 bg-white shadow-lg flex justify-center items-center mt-[10px]'>
                  <div className='w-[60px] h-[60px]   rounded-full overflow-hidden flex justify-center items-center '>
                    <img src={user.image || dp} alt="" className='h-[100%]'/>
                  </div>
                  {onlineUsers?.includes(user._id) &&
                    <span className='w-[12px] h-[12px] rounded-full absolute bottom-[6px] right-[-1px] bg-[#3aff20] shadow-gray-500 shadow-md'></span>}
                </div>
                <h1 className='text-gray-800 font-semibold text-[20px]'>{user.name || user.userName}</h1>
              </div>
            ))}
          </>
        )}
        {activeTab==='groups' && (
          <>
            <div className='w-[95%] flex justify-between items-center slide-down'>
              <h2 className='text-gray-700 font-semibold'>Groups</h2>
              <button className='text-sm bg-violet-600 text-white px-3 py-1 rounded-full shadow' onClick={()=>setShowCreateGroup(true)}>New Group</button>
            </div>
            {(groups||[])?.map(g=> (
              <div 
                key={g._id}
                className='w-[95%] h-[70px] flex items-center gap-[20px] shadow-gray-500 bg-white shadow-lg rounded-full hover:bg-violet-100 cursor-pointer p-2 fade-in'
                onClick={()=>{dispatch(setSelectedGroup(g)); dispatch(setSelectedUser(null))}}
              >
                <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center hover-scale'>
                  <img src={g.image || dp} alt="" className='h-[100%]' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-center'>
                    <h1 className='text-gray-800 font-semibold text-[16px] truncate'>{g.name}</h1>
                  </div>
                  <p className='text-[13px] text-gray-600 truncate'>Members: {g.partcipants?.length || 0}</p>
                </div>
              </div>
            ))}
            {!groups?.length && (
              <div className='w-[95%] text-gray-600 text-sm'>You have no groups yet.</div>
            )}
          </>
        )}
        {activeTab==='settings' && (
          <div className='w-[95%] bg-white rounded-xl p-4 shadow fade-in'>
            <h3 className='text-gray-800 font-semibold mb-2'>Settings</h3>
            <div className='text-sm text-gray-600'>
              <button className='px-3 py-2 bg-violet-600 text-white rounded-lg shadow' onClick={()=>navigate('/profile')}>Open Profile</button>
            </div>
          </div>
        )}
      </div>
    <CreateGroupModal open={showCreateGroup} onClose={()=>setShowCreateGroup(false)} />
    </div>
  )
}

export default SideBar