import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import groupRouter from "./routes/group.routes.js"
import { app, server } from "./socket/socket.js"
import path from "path"
import { fileURLToPath } from "url"

const port=process.env.PORT || 5000


app.use(cors({
    origin:"https://chatly-team-chat-system-frontend.onrender.com",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
// serve static uploads so local file fallback can be accessed by frontend
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use("/public", express.static(path.join(__dirname, "public")))
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/message",messageRouter)
app.use("/api/group",groupRouter)



server.listen(port,()=>{
    connectDb()
    console.log("server started")
})
