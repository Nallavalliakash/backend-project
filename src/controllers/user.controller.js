import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadcloudinaryfile } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const registeruser=asynchandler(async (req,res)=>{
  const{fullname,email,username,password}=req.body
  console.log("email:",email);
  if (
    [username,fullname,email,password].some((field)=>field?.trim()==="")
  ) {
    throw new ApiError(400,"all fields are required")
  }

  const existedUser=User.findOne({
    $or:[{username},{email}]
  })

  if (existedUser) {
    throw new ApiError(409,"username already exists")
    }

    const avatarlocalpath=req.files?.avatar[0]?.path;
    const coverimagelocalpath=req.files?.coverimage[0]?.path;

    if (!avatarlocalpath) {
      throw new ApiError(400,"Avatar is required")
    }

    const avatar=await uploadcloudinaryfile(avatarlocalpath)
    const coverimage=await uploadcloudinaryfile(coverimagelocalpath)

    if (!avatar) {
      throw new ApiError(409,"Avatar is required")
    }

    const user=await User.create({
      fullname,
      avatar: avatar.url,
      coverimage: coverimage?.url || "",
      email,
      password,
      username:username.toLowercase()
    })

    const createdUser=await user.findbyId(user._id).select("-password -refreshtoken")

    if (!createdUser) {
      throw new ApiError(500,"Something went wrong")
    }

    return res.status(201).json(
      new ApiResponse(200,createdUser,"User registered succesfully")
    )

    







})


  export{
    registeruser,
  }
