import mongoose,{Schema} from "mongoose"

const likeschema=new schema({
    video:{
        type:Schema.Types.objectId,
        ref:"Video"
    },
    comment:{
        type:Schema.Types.objectId,
        ref:"Comment"
    },
    tweet:{
        type:Schema.Types.objectId,
        ref:"Tweet"
    },
    likedby:{
        type:Schema.Types.objectId,
        ref:"User"
    },
    

},{timestamps:true})

export const Like=mongoose.model("Like",likeschema)