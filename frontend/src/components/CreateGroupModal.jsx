import React from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { serverUrl } from '../main'
import dp from "../assets/dp.webp"
import { setGroups } from '../redux/userSlice'

function CreateGroupModal({ open, onClose }){
  const dispatch = useDispatch()
  const { otherUsers } = useSelector(s=>s.user)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [imageFile, setImageFile] = React.useState(null)
  const [selected, setSelected] = React.useState([])
  const fileRef = React.useRef()
  const [submitting, setSubmitting] = React.useState(false)

  const toggleUser = (id)=>{
    setSelected(prev=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()
    if(!name.trim()) return
    try{
      setSubmitting(true)
      const fd = new FormData()
      fd.append('name', name.trim())
      // description is optional; backend may ignore
      fd.append('description', description.trim())
      if(imageFile){ fd.append('image', imageFile) }
      fd.append('members', JSON.stringify(selected))
      await axios.post(`${serverUrl}/api/group/create`, fd, {withCredentials:true})
      // refresh groups
      const list = await axios.get(`${serverUrl}/api/group/list`, {withCredentials:true})
      dispatch(setGroups(list.data))
      setSubmitting(false)
      onClose?.()
      setName(""); setDescription(""); setImageFile(null); setSelected([])
    }catch(err){
      console.log(err)
      setSubmitting(false)
    }
  }

  if(!open) return null

  return createPortal(
    <div className='fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center' onClick={onClose}>
      <form onClick={(e)=>e.stopPropagation()} onSubmit={handleSubmit} className='bg-white w-[92%] max-w-[640px] rounded-2xl shadow-xl p-5 space-y-4 pop-in'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-semibold text-gray-800'>Create Group</h3>
          <button type='button' onClick={onClose} className='text-gray-500 hover:text-gray-700'>✕</button>
        </div>
        <div className='flex gap-4 items-center'>
          <div className='w-[64px] h-[64px] rounded-full overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer hover-scale' onClick={()=>fileRef.current.click()}>
            <img src={imageFile ? URL.createObjectURL(imageFile) : dp} alt='' className='h-[100%]' />
          </div>
          <div className='flex-1 grid gap-3'>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder='Group name' className='border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-300' />
            <input value={description} onChange={e=>setDescription(e.target.value)} placeholder='Description (optional)' className='border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-300' />
          </div>
        </div>
        <input type='file' ref={fileRef} hidden accept='image/*' onChange={e=> setImageFile(e.target.files?.[0] || null)} />

        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700'>Add members</h4>
          <div className='max-h-48 overflow-auto border rounded-lg p-2 grid gap-2'>
            {(otherUsers||[])?.map(u=> (
              <label key={u._id} className='flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer'>
                <input type='checkbox' className='accent-sky-500' checked={selected.includes(u._id)} onChange={()=>toggleUser(u._id)} />
                <div className='w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm'>
                  <img src={u.image || dp} alt='' className='h-[100%]' />
                </div>
                <span className='text-gray-800 text-sm'>{u.name || u.userName}</span>
              </label>
            ))}
            {!otherUsers?.length && (
              <div className='text-sm text-gray-500 px-1 py-2'>No other users found.</div>
            )}
          </div>
        </div>

        <div className='flex justify-end gap-2'>
          <button type='button' onClick={onClose} className='px-3 py-2 rounded-lg border'>Cancel</button>
          <button disabled={submitting || !name.trim()} className='px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50'>
            {submitting? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}

export default CreateGroupModal


