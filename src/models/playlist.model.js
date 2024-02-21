import mongoose,{schema} from "mongoose"

const playlistschema=new schema({
    name:{
        type:"string",
        required:true
    },
    description:{
        type:"string",
        required:true
    },
    videos:{
        type:mongoose.Types.ObjectId,
        ref:'Video'
    },
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",playlistschema)