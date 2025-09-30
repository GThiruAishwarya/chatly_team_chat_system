import mongoose from "mongoose"
const messageSchema=new mongoose.Schema({
sender:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
receiver:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:false
},
group:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Conversation",
    required:false
},
message:{
    type:String,
    default:""
},
image:{
    type:String,
    default:""
},
video:{
    type:String,
    default:""
},
audio:{
    type:String,
    default:""
},
file:{
    type:String,
    default:""
},
gif:{
    type:String,
    default:""
},
sticker:{
    type:String,
    default:""
},
replyTo:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Message",
    required:false
},
reactions:[{
    type:String,
    default:""
}],
status:{
    type:String,
    default:"sent" // sent | delivered | read
},
isDeletedForEveryone:{
    type:Boolean,
    default:false
},
deletedFor:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
}],
mentions:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
}]


},{timestamps:true})

const Message=mongoose.model("Message",messageSchema)
export default Message