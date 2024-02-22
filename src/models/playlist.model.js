import mongoose,{Schema, SchemaTypeOptions} from "mongoose"

const playlistschema=new Schema({
    name:{
        type:"string",
        required:true
    },
    description:{
        type:"string",
        required:true
    },
    videos:{
        type:Schema.Types.ObjectId,
        ref:'Video'
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Playlist=mongoose.model("Playlist",playlistschema)