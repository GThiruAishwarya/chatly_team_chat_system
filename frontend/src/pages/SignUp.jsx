import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function SignUp() {
    let navigate=useNavigate()
    let [show,setShow]=useState(false)
let [userName,setUserName]=useState("")
let [email,setEmail]=useState("")
let [password,setPassword]=useState("")
let [loading,setLoading]=useState(false)
let [err,setErr]=useState("")
let dispatch=useDispatch()

    const handleSignUp=async (e)=>{
        e.preventDefault()
        setLoading(true)
        try {
            let result =await axios.post(`${serverUrl}/api/auth/signup`,{
userName,email,password
            },{withCredentials:true})
           dispatch(setUserData(result.data))
           navigate("/profile")
            setEmail("")
            setPassword("")
            setLoading(false)
            setErr("")
        } catch (error) {
            console.log(error)
            setLoading(false)
            setErr(error?.response?.data?.message)
        }
    }

  return (
    <div className='min-h-[100vh] w-full bg-gradient-to-b from-white to-violet-50 flex items-center justify-center px-4'>
      <div className='w-full max-w-[560px] bg-white rounded-2xl shadow-xl p-8 relative'>
        <div className='absolute -top-8 left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-2xl bg-violet-600 shadow-[0_0_40px_rgba(139,92,246,0.45)] flex items-center justify-center text-white text-2xl'>✨</div>
        <div className='mt-8 text-center mb-6'>
          <h1 className='text-3xl font-extrabold text-gray-900'>Create your account</h1>
          <p className='text-gray-500 mt-2'>Join and start chatting in seconds</p>
        </div>
        <form className='flex flex-col gap-4' onSubmit={handleSignUp}>
          <input type="text" placeholder='Username' className='h-[52px] rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-violet-300' onChange={(e)=>setUserName(e.target.value)} value={userName}/>
          <input type="email" placeholder='Email' className='h-[52px] rounded-xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-violet-300'  onChange={(e)=>setEmail(e.target.value)} value={email}/>
          <div className='h-[52px] rounded-xl border border-gray-200 px-4 flex items-center gap-2'>
            <input type={`${show?"text":"password"}`} placeholder='Password' className='w-full h-full outline-none'  onChange={(e)=>setPassword(e.target.value)} value={password}/>
            <span className='text-violet-600 text-sm font-semibold cursor-pointer' onClick={()=>setShow(prev=>!prev)}>{`${show?"Hide":"Show"}`}</span>
          </div>
          {err && <p className='text-red-500 text-sm'>{"*" + err}</p>}
          <button className='mt-2 h-[52px] rounded-xl bg-violet-600 text-white font-semibold shadow-[0_8px_30px_rgba(139,92,246,0.35)] hover:bg-violet-700 transition disabled:opacity-50' disabled={loading}>{loading?"Loading...":"Sign Up"}</button>
        </form>
        <div className='text-center text-gray-600 mt-6'>
          Already have an account? <span className='text-violet-600 font-semibold cursor-pointer' onClick={()=>navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  )
}

export default SignUp
