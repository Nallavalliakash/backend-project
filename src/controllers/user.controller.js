import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadcloudinaryfile} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/Apiresponse.js";

const registeruser = asynchandler(async (req, res) => {
  const { fullname, email, password, username } = req.body; // Move inside the handler function
  console.log("email:", email);
  if (
    [username, fullname, email, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError("ALL FIELDS ARE REQUIRED");
  }

  const existeduser=user.findone({
    $or:[{username},{email}]
  })
  if (existeduser) {
    throw new ApiError(409,"username or email already exists")
    }

   const avatarlocalpath=req.files?.avatar[0]?.path;
   const coverimagelocalpath=req.files?.coverimage[0]?.path;

   if(!avatarlocalpath){
    throw new ApiError(400,"avatar is required")
   }

   const avatar=await uploadcloudinaryfile(avatarlocalpath)
   const coverimage=await uploadcloudinaryfile(coverimagelocalpath)

   if (avatar) {
    throw new ApiError(400,"avatar is required")
    }

    const user=await User.create({
      fullname,
      avatar:avatar.url,
      coveriamge: coverimage?.url || "",
      email,
      password,
      username:username.tolowercase()
    })

    const createduser=await user.findbyId(user._id).select("-password -refreshtoken")
    if (!createduser) {
      throw new ApiError(500,"something went wrong")
      }

      return res.status(201).json(
        new ApiResponse(200,createdUser,"user registerd suucessfully")
      )



  
});

export { registeruser };
