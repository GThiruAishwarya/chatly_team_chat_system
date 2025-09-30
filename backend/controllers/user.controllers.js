import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/user.model.js"

export const getCurrentUser=async (req,res)=>{
try {
    let user=await User.findById(req.userId).select("-password")
    if(!user){
        return res.status(400).json({message:"user not found"})
    }

    return res.status(200).json(user)
} catch (error) {
    return res.status(500).json({message:`current user error ${error}`})
}
}

export const editProfile=async (req,res)=>{
    try {
        let {name}=req.body
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path)
        }
        let user=await User.findByIdAndUpdate(req.userId,{
           name,
           image 
        },{new:true})

        if(!user){
            return res.status(400).json({message:"user not found"})
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`profile error ${error}`})
    }
}

export const getOtherUsers=async (req,res)=>{
    try {
        let users=await User.find({
            _id:{$ne:req.userId}
        }).select("-password")
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({message:`get other users error ${error}`})
    }
}

export const search =async (req,res)=>{
    try {
        let {query}=req.query
        if(!query){
            return res.status(400).json({message:"query is required"})
        }
        let users=await User.find({
            $or:[
                {name:{$regex:query,$options:"i"}},
                {userName:{$regex:query,$options:"i"}},
            ]
        })
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({message:`search users error ${error}`})
    }
}

export const updateUserStatus = async (req, res) => {
    try {
        const userId = req.userId
        const { status } = req.body
        const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select("-password")
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`update status error ${error}`})
    }
}

export const blockUser = async (req, res) => {
    try {
        const userId = req.userId
        const { targetUserId } = req.body
        const user = await User.findById(userId)
        if(!user.blockedUsers.includes(targetUserId)){
            user.blockedUsers.push(targetUserId)
            await user.save()
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`block user error ${error}`})
    }
}

export const unblockUser = async (req, res) => {
    try {
        const userId = req.userId
        const { targetUserId } = req.body
        const user = await User.findById(userId)
        user.blockedUsers = user.blockedUsers.filter(id => String(id) !== String(targetUserId))
        await user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`unblock user error ${error}`})
    }
}

export const muteUser = async (req, res) => {
    try {
        const userId = req.userId
        const { targetUserId } = req.body
        const user = await User.findById(userId)
        if(!user.mutedUsers.includes(targetUserId)){
            user.mutedUsers.push(targetUserId)
            await user.save()
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`mute user error ${error}`})
    }
}

export const unmuteUser = async (req, res) => {
    try {
        const userId = req.userId
        const { targetUserId } = req.body
        const user = await User.findById(userId)
        user.mutedUsers = user.mutedUsers.filter(id => String(id) !== String(targetUserId))
        await user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`unmute user error ${error}`})
    }
}