import Conversation from "../models/conversation.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import Message from "../models/message.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js"

export const createGroup = async (req, res) => {
    try{
        const creatorId = req.userId
        const { name, members } = req.body // members as JSON array of userIds
        let image
        if(req.file){
            image = await uploadOnCloudinary(req.file.path)
            if(!image){
                image = `/public/${req.file.originalname}`
            }
        }
        const memberIds = Array.isArray(members) ? members : JSON.parse(members || "[]")
        const uniqueMembers = Array.from(new Set([creatorId, ...memberIds]))
        const group = await Conversation.create({
            isGroup:true,
            name: name || "New Group",
            image: image || "",
            admins:[creatorId],
            partcipants: uniqueMembers,
            messages:[]
        })
        // notify all online members that a new group has been created
        try{
            uniqueMembers.forEach(uid => {
                const sid = getReceiverSocketId(String(uid))
                if(sid){
                    io.to(sid).emit("groupCreated", group)
                }
            })
        }catch(_e){}
        return res.status(201).json(group)
    }catch(error){
        return res.status(500).json({message:`create group error ${error}`})
    }
}

export const addMember = async (req, res) => {
    try{
        const userId = req.userId
        const { groupId } = req.params
        const { memberId } = req.body
        const group = await Conversation.findById(groupId)
        if(!group || !group.isGroup){
            return res.status(404).json({message:"Group not found"})
        }
        if(!group.admins.map(String).includes(String(userId))){
            return res.status(403).json({message:"Only admins can add members"})
        }
        if(!group.partcipants.map(String).includes(String(memberId))){
            group.partcipants.push(memberId)
            await group.save()
            
            // Send notification to all group members
            group.partcipants.forEach(uid => {
                const idStr = String(uid)
                const sid = getReceiverSocketId(idStr)
                if(sid){
                    io.to(sid).emit("groupNotification", { 
                        type: "member_added",
                        groupId,
                        groupName: group.name,
                        memberId,
                        addedBy: userId
                    })
                }
            })
        }
        return res.status(200).json(group)
    }catch(error){
        return res.status(500).json({message:`add member error ${error}`})
    }
}

export const removeMember = async (req, res) => {
    try{
        const userId = req.userId
        const { groupId } = req.params
        const { memberId } = req.body
        const group = await Conversation.findById(groupId)
        if(!group || !group.isGroup){
            return res.status(404).json({message:"Group not found"})
        }
        if(!group.admins.map(String).includes(String(userId))){
            return res.status(403).json({message:"Only admins can remove members"})
        }
        group.partcipants = group.partcipants.filter(id => String(id) !== String(memberId))
        await group.save()
        
        // Send notification to remaining group members
        group.partcipants.forEach(uid => {
            const idStr = String(uid)
            const sid = getReceiverSocketId(idStr)
            if(sid){
                io.to(sid).emit("groupNotification", { 
                    type: "member_removed",
                    groupId,
                    groupName: group.name,
                    memberId,
                    removedBy: userId
                })
            }
        })
        
        return res.status(200).json(group)
    }catch(error){
        return res.status(500).json({message:`remove member error ${error}`})
    }
}

export const listGroups = async (req, res) => {
    try{
        const userId = req.userId
        const groups = await Conversation.find({ isGroup:true, partcipants: { $in: [userId] } })
        return res.status(200).json(groups)
    }catch(error){
        return res.status(500).json({message:`list groups error ${error}`})
    }
}

export const getGroupMessages = async (req, res) => {
    try{
        const { groupId } = req.params
        const group = await Conversation.findById(groupId).populate("messages")
        if(!group){
            return res.status(404).json({message:"Group not found"})
        }
        return res.status(200).json(group.messages)
    }catch(error){
        return res.status(500).json({message:`get group messages error ${error}`})
    }
}

export const sendGroupMessage = async (req, res) => {
    try{
        const sender = req.userId
        const { groupId } = req.params
        const { message, gif, sticker, mentions } = req.body
        const group = await Conversation.findById(groupId)
        if(!group || !group.isGroup){
            return res.status(404).json({message:"Group not found"})
        }
        if(!group.partcipants.map(String).includes(String(sender))){
            return res.status(403).json({message:"Not a group member"})
        }
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
        
        // Parse mentions if provided
        let mentionIds = []
        if(mentions){
            try {
                mentionIds = JSON.parse(mentions)
            } catch(e) {
                mentionIds = Array.isArray(mentions) ? mentions : []
            }
        }
        
        const newMessage = await Message.create({ 
            sender, 
            group: groupId, 
            message, 
            image, 
            video, 
            audio, 
            file:fileUrl, 
            gif, 
            sticker,
            mentions: mentionIds,
            status:"sent" 
        })
        
        // Populate sender information
        await newMessage.populate('sender', 'name userName')
        
        group.messages.push(newMessage._id)
        await group.save()
        
        // emit to all online members except sender
        group.partcipants.forEach(uid => {
            const idStr = String(uid)
            if(idStr!==String(sender)){
                const sid = getReceiverSocketId(idStr)
                if(sid){
                    // Include sender name in the message data
                    const messageWithSender = {
                        ...newMessage.toObject(),
                        senderName: newMessage.sender?.name || newMessage.sender?.userName || "Someone"
                    }
                    io.to(sid).emit("newGroupMessage", { ...messageWithSender, group: groupId })
                }
            }
        })
        
        // Send special notification to mentioned users
        if(mentionIds.length > 0){
            mentionIds.forEach(mentionId => {
                const sid = getReceiverSocketId(String(mentionId))
                if(sid){
                    io.to(sid).emit("mentioned", { 
                        message: newMessage, 
                        group: groupId,
                        groupName: group.name 
                    })
                }
            })
        }
        
        return res.status(201).json(newMessage)
    }catch(error){
        return res.status(500).json({message:`send group message error ${error}`})
    }
}


