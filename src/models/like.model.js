import mongoose,{schema} from "mongoose"

const likeschema=new schema({
    video:{
        type:schema.Types.objectId,
        ref:"Video"
    },
    comment:{
        type:schema.Types.objectId,
        ref:"Comment"
    },
    tweet:{
        type:schema.Types.objectId,
        ref:"Tweet"
    },
    likedby:{
        type:schema.Types.objectId,
        ref:"User"
    },
    

},{timestamps:true})

export const Like=mongoose.model("Like",likeschema)