import express from "express"
import { blockUser, editProfile, getCurrentUser, getOtherUsers, muteUser, search, unblockUser, unmuteUser, updateUserStatus } from "../controllers/user.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"

const userRouter=express.Router()

userRouter.get("/current",isAuth, getCurrentUser)
userRouter.get("/others",isAuth, getOtherUsers)
userRouter.put("/profile",isAuth,upload.single("image"),editProfile)
userRouter.get("/search",isAuth, search)
userRouter.put("/status",isAuth,updateUserStatus)
userRouter.post("/block",isAuth,blockUser)
userRouter.post("/unblock",isAuth,unblockUser)
userRouter.post("/mute",isAuth,muteUser)
userRouter.post("/unmute",isAuth,unmuteUser)
export default userRouter