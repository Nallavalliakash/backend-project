import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    index: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  coverimage: {
    type: String,
    required: true,
  },
  watchhistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  password: {
    type: String,
    required: true,
  },
  refreshtoken: {
    type: String,
  },
  
},{timestamps:true});

userschema.pre("save", async function(next){
    if(!this.modified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next()
})

userschema.methods.isPasswordcorrect=async function (password){
     return await bcrypt.compare(password,this.password)
}

userschema.generateAccesstoken=function(){
    return jwt.sign({
        _id:this._id,
        username:this.username
    })
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
}
userschema.generateRefreshtoken=function(){
    return jwt.sign({
        _id:this._id,
        
    })
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
}


export const User = mongoose.model("User", userschema);
