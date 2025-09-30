import React, { useRef, useState } from 'react'
import dp from "../assets/dp.webp"
import { IoCameraOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../main';
import { setUserData } from '../redux/userSlice';
function Profile() {
    let {userData}=useSelector(state=>state.user)
    let dispatch=useDispatch()
    let navigate=useNavigate()
let [name,setName]=useState(userData.name || "")
let [frontendImage,setFrontendImage]=useState(userData.image || dp)
let [backendImage,setBackendImage]=useState(null)
let [status,setStatus]=useState(userData.status || "online")
let image=useRef()
let [saving,setSaving]=useState(false)
const handleImage=(e)=>{
    let file=e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
}

const handleProfile=async (e)=>{
   
e.preventDefault()
setSaving(true)
try {

    let formData=new FormData()
    formData.append("name",name)
    if(backendImage){
        formData.append("image",backendImage) 
    }
    let result=await axios.put(`${serverUrl}/api/user/profile`,formData,{withCredentials:true})
    
    // Update status separately
    await axios.put(`${serverUrl}/api/user/status`, { status }, {withCredentials:true})
    
    setSaving(false)
    dispatch(setUserData({...result.data, status}))
    navigate("/")
} catch (error) {
    console.log(error)
    setSaving(false)
}
}
  return (
    <div className='w-full h-[100vh] bg-slate-200 flex flex-col justify-center items-center gap-[20px]'>
        <div className='fixed top-[20px] left-[20px] cursor-pointer' onClick={()=>navigate("/")}>
        <IoIosArrowRoundBack className='w-[50px] h-[50px] text-gray-600'/>
        </div>
     <div className=' bg-white rounded-full border-4 border-[#20c7ff] shadow-gray-400 shadow-lg  relative' onClick={()=>image.current.click()}>
<div className='w-[200px] h-[200px] rounded-full overflow-hidden flex justify-center items-center'>
<img src={frontendImage} alt="" className='h-[100%]'/>
</div>
<div className='absolute bottom-4  text-gray-700 right-4 w-[35px] h-[35px] rounded-full bg-[#20c7ff] flex justify-center items-center shadow-gray-400 shadow-lg'>
<IoCameraOutline className=' text-gray-700  w-[25px] h-[25px]'/>
</div>
     </div>
     <form className='w-[95%]  max-w-[500px] flex flex-col gap-[20px] items-center justify-center' onSubmit={handleProfile}>
        <input type="file" accept='image/*' ref={image} hidden onChange={handleImage}/>
        <input type="text" placeholder="Enter your name" className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-[white] rounded-lg shadow-gray-400 shadow-lg text-gray-700 text-[19px]' onChange={(e)=>setName(e.target.value)} value={name}/>
        <input type="text"  readOnly className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-[white] rounded-lg shadow-gray-400 shadow-lg text-gray-400 text-[19px]' value={userData?.userName}/>
        <input type="email" readOnly className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-[white] rounded-lg shadow-gray-400 shadow-lg text-gray-400 text-[19px]' value={userData?.email}/>
        
        <div className='w-[90%] flex flex-col gap-2'>
          <label className='text-gray-700 font-semibold'>Status</label>
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
        </div>
        
        <div className='w-[90%] flex flex-col gap-2'>
          <label className='text-gray-700 font-semibold'>Privacy Settings</label>
          <div className='flex gap-2'>
            <button 
              type="button"
              className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
              onClick={async () => {
                try {
                  await axios.post(`${serverUrl}/api/user/block`, { targetUserId: userData._id }, {withCredentials:true})
                  alert('User blocked successfully')
                } catch (error) {
                  console.log(error)
                }
              }}
            >
              Block User
            </button>
            <button 
              type="button"
              className='px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600'
              onClick={async () => {
                try {
                  await axios.post(`${serverUrl}/api/user/mute`, { targetUserId: userData._id }, {withCredentials:true})
                  alert('User muted successfully')
                } catch (error) {
                  console.log(error)
                }
              }}
            >
              Mute User
            </button>
          </div>
        </div>
        <button className='px-[20px] py-[10px] bg-[#20c7ff] rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[200px] mt-[20px] font-semibold hover:shadow-inner' disabled={saving}>{saving?"Saving...":"Save Profile"}</button>
     </form>
    </div>
  )
}

export default Profile
