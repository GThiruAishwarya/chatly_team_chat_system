import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{
        type:String,
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
image:{
    type:String,
    default:""
},
status:{
    type:String,
    default:"online" // online | away | busy | offline
},
blockedUsers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
}],
mutedUsers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
}]
},{timestamps:true})

const User=mongoose.model("User",userSchema)

export default User