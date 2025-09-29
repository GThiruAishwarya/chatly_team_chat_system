import mongoose, { mongo } from "mongoose";

const conversationSchema=new mongoose.Schema({
    isGroup:{
        type:Boolean,
        default:false
    },
    name:{
        type:String,
        default:""
    },
    image:{
        type:String,
        default:""
    },
    admins:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    partcipants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
messages:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Message"
    }
]
},{timestamps:true})

const Conversation=mongoose.model("Conversation",conversationSchema)

export default Conversation