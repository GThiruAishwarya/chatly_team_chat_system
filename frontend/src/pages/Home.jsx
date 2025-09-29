import React from 'react'
import SideBar from '../components/SideBar'
import MessageArea from '../components/MessageArea'
import { useDispatch, useSelector } from 'react-redux'
import getMessage from '../customHooks/getMessages'
import axios from 'axios'
import { serverUrl } from '../main'
import { setGroups } from '../redux/userSlice'


function Home() {
  let {selectedUser,userData}=useSelector(state=>state.user)
  const dispatch = useDispatch()
 getMessage()
  React.useEffect(()=>{
    const loadGroups = async ()=>{
      if(!userData) return
      try{
        const res = await axios.get(`${serverUrl}/api/group/list`, {withCredentials:true})
        dispatch(setGroups(res.data))
      }catch(e){
        console.log(e)
      }
    }
    loadGroups()
  },[userData])
  return (
    <div className='w-full h-[100vh] flex  '>
     <SideBar/>
     <MessageArea/>
    </div>
  )
}

export default Home
