import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage=async (req,res)=>{
    try {
        let sender=req.userId
        let {receiver}=req.params
        let {message, gif} = req.body

        let image, video, audio, fileUrl
        if(req.file){
            const uploaded = await uploadOnCloudinary(req.file.path)
            const mime = req.file.mimetype
            if(mime.startsWith("image/")){
                image = uploaded || `/public/${req.file.originalname}`
            } else if(mime.startsWith("video/")){
                video = uploaded || `/public/${req.file.originalname}`
            } else if(mime.startsWith("audio/")){
                audio = uploaded || `/public/${req.file.originalname}`
            } else {
                fileUrl = uploaded || `/public/${req.file.originalname}`
            }
        }

        let conversation=await Conversation.findOne({
            partcipants:{$all:[sender,receiver]}
        })

        let newMessage=await Message.create({
            sender,receiver,message,image,video,audio,file:fileUrl,gif,status:"sent"
        })

        if(!conversation){
            conversation=await Conversation.create({
                partcipants:[sender,receiver],
                messages:[newMessage._id]
            })
        }else{
            conversation.messages.push(newMessage._id)
            await conversation.save()
        }

        const receiverSocketId=getReceiverSocketId(receiver)
if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage",newMessage)
    // delivered as it reached receiver's socket namespace
    newMessage.status = "delivered"
    await newMessage.save()
    io.to(receiverSocketId).emit("messageStatus", { messageId: newMessage._id, status: "delivered" })
}


        
        return res.status(201).json(newMessage)
    
    } catch (error) {
        return res.status(500).json({message:`send Message error ${error}`})
    }
}

export const getMessages=async (req,res)=>{
    try {
        let sender=req.userId
        let {receiver}=req.params
        let conversation=await Conversation.findOne({
            partcipants:{$all:[sender,receiver]}
        }).populate("messages")

        return res.status(200).json(conversation?.messages)
    } catch (error) {
        return res.status(500).json({message:`get Message error ${error}`})
    }
}

export const markMessagesRead = async (req, res) => {
    try{
        const userId = req.userId
        const { withUserId } = req.params
        const conversation = await Conversation.findOne({ partcipants:{$all:[userId, withUserId]} })
        if(!conversation){
            return res.status(200).json({updated:0})
        }
        const updated = await Message.updateMany({
            _id: { $in: conversation.messages },
            receiver: userId,
            status: { $ne: "read" }
        }, {$set: { status: "read" }})
        // notify sender(s) their messages were read
        const msgs = await Message.find({ _id: { $in: conversation.messages }, receiver: userId, status: "read" })
        msgs.forEach(m=>{
            const senderSocketId = getReceiverSocketId(String(m.sender))
            if(senderSocketId){
                io.to(senderSocketId).emit("messageStatus", { messageId: m._id, status: "read" })
            }
        })
        return res.status(200).json({updated: updated.modifiedCount || 0})
    }catch(error){
        return res.status(500).json({message:`mark read error ${error}`})
    }
}

export const deleteMessageForMe = async (req, res) => {
    try {
        const userId = req.userId
        const { messageId } = req.params
        const message = await Message.findById(messageId)
        if(!message){
            return res.status(404).json({message:"Message not found"})
        }
        // mark deleted for this user
        if(!message.deletedFor?.some(id=>String(id)===String(userId))){
            message.deletedFor = [...(message.deletedFor||[]), userId]
            await message.save()
        }
        return res.status(200).json({success:true})
    } catch (error) {
        return res.status(500).json({message:`delete for me error ${error}`})
    }
}

export const deleteMessageForEveryone = async (req, res) => {
    try {
        const userId = req.userId
        const { messageId } = req.params
        const message = await Message.findById(messageId)
        if(!message){
            return res.status(404).json({message:"Message not found"})
        }
        // only sender can delete for everyone
        if(String(message.sender) !== String(userId)){
            return res.status(403).json({message:"Not allowed"})
        }
        message.isDeletedForEveryone = true
        message.message = ""
        message.image = ""
        await message.save()

        const receiverSocketId = getReceiverSocketId(String(message.receiver))
        if(receiverSocketId){
            io.to(receiverSocketId).emit("messageDeleted", { messageId })
        }
        return res.status(200).json({success:true})
    } catch (error) {
        return res.status(500).json({message:`delete for everyone error ${error}`})
    }
}