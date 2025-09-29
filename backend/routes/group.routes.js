import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { addMember, createGroup, getGroupMessages, listGroups, removeMember, sendGroupMessage } from "../controllers/group.controllers.js"

const groupRouter = express.Router()

groupRouter.post("/create", isAuth, upload.single("image"), createGroup)
groupRouter.post("/add/:groupId", isAuth, addMember)
groupRouter.post("/remove/:groupId", isAuth, removeMember)
groupRouter.get("/list", isAuth, listGroups)
groupRouter.get("/messages/:groupId", isAuth, getGroupMessages)
groupRouter.post("/send/:groupId", isAuth, upload.single("attachment"), sendGroupMessage)

export default groupRouter


