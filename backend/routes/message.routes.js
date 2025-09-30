import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { deleteMessageForEveryone, deleteMessageForMe, getMessages, markMessagesRead, reactToMessage, sendMessage } from "../controllers/message.controllers.js"

const messageRouter=express.Router()

messageRouter.post("/send/:receiver",isAuth,upload.single("image"),sendMessage)
messageRouter.get("/get/:receiver",isAuth,getMessages)
messageRouter.post("/read/:withUserId", isAuth, markMessagesRead)
messageRouter.post("/react/:messageId", isAuth, reactToMessage)
messageRouter.delete("/delete/me/:messageId", isAuth, deleteMessageForMe)
messageRouter.delete("/delete/everyone/:messageId", isAuth, deleteMessageForEveryone)
export default messageRouter