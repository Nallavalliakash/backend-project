import mongoose,{schema} from "mongoose"

const tweetschema=new schema({
    content:{
        type:"string",
        required:true
    },
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User"
    },
    
},{timestamps:true})


export const Tweet=mongoose.model("Tweet",tweetschema)