import mongoose,{schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoschema=new mongoose.schema({
    videofile:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:number,
        required:true
    },
    views:{
        type:number,
        default:true
    },
    ispublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:schema.Types.objectId,
        ref:"User"
    },


},{timestamps:true})
videoschema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoschema)