import mongoose,{schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentschema=new schema({
    content:{
        type:"string",
        required:true,
    },
    video:{
        type:schema.Types.objectId,
        ref:"Video"
    },
    owner:{
        type:schema.Types.objectId,
        ref:"User"
    },


},{timestamps:true})



commentschema.plugin(mongooseAggregatePaginate)

export const Comment= mongoose.Model("Comment",commentschema)