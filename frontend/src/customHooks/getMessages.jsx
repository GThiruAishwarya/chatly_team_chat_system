import axios from "axios"
import { useEffect } from "react"
import { serverUrl } from "../main"
import { useDispatch, useSelector } from "react-redux"
import { setOtherUsers, setUserData } from "../redux/userSlice"
import { setMessages } from "../redux/messageSlice"

function getMessage(){
  const dispatch = useDispatch()
  const {selectedUser,selectedGroup} = useSelector(s=>s.user)

  useEffect(()=>{
    const load = async ()=>{
      try{
        if(selectedUser){
          const res = await axios.get(`${serverUrl}/api/message/get/${selectedUser._id}`, {withCredentials:true})
          dispatch(setMessages(res.data))
          // mark read for personal chat
          await axios.post(`${serverUrl}/api/message/read/${selectedUser._id}`, {}, {withCredentials:true})
        } else if(selectedGroup){
          const res = await axios.get(`${serverUrl}/api/group/messages/${selectedGroup._id}`, {withCredentials:true})
          dispatch(setMessages(res.data))
        } else {
          dispatch(setMessages(null))
        }
      }catch(e){
        console.log(e)
      }
    }
    load()

    const onFocus = async ()=>{
      try{
        if(selectedUser){
          await axios.post(`${serverUrl}/api/message/read/${selectedUser._id}`, {}, {withCredentials:true})
        }
      }catch(e){
        // ignore
      }
    }
    window.addEventListener('focus', onFocus)
    return ()=>{
      window.removeEventListener('focus', onFocus)
    }
  },[selectedUser, selectedGroup])
}

export default getMessage