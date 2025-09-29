import axios from "axios"
import { useEffect } from "react"
import { serverUrl } from "../main"
import { useDispatch, useSelector } from "react-redux"
import { setOtherUsers, setUserData } from "../redux/userSlice"
import { setMessages } from "../redux/messageSlice"

const getMessage=()=>{
    let dispatch=useDispatch()
    let {userData,selectedUser,selectedGroup}=useSelector(state=>state.user)
    useEffect(()=>{
        const fetchMessages=async ()=>{
            try {
                if(selectedUser){
                    let result=await axios.get(`${serverUrl}/api/message/get/${selectedUser._id}`,{withCredentials:true})
                    dispatch(setMessages(result.data))
                    await axios.post(`${serverUrl}/api/message/read/${selectedUser._id}`,{}, {withCredentials:true})
                } else if(selectedGroup){
                    let result=await axios.get(`${serverUrl}/api/group/messages/${selectedGroup._id}`,{withCredentials:true})
                    dispatch(setMessages(result.data))
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchMessages()
    },[selectedUser,selectedGroup,userData])
}

export default getMessage