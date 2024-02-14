import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadcloudinaryfile } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";

const generateAccessandRefreshtokens = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accesstoken = user.generateAccesstoken();
    const refreshtoken = user.generateRefreshtoken();

    user.refreshtoken=refreshtoken
    user.save({ validateBeforesSave:false })

    return{accesstoken,refreshtoken}

  } catch (error) {
    throw new ApiError(500, "Somthing went wrong");
  }
};

const registeruser = asynchandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email:", email);
  if (
    [username, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarlocalpath = req.files?.avatar[0]?.path;
  const coverimagelocalpath = req.files?.coverimage[0]?.path;

  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadcloudinaryfile(avatarlocalpath);
  const coverimage = await uploadcloudinaryfile(coverimagelocalpath);

  if (!avatar) {
    throw new ApiError(409, "Avatar is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowercase(),
  });

  const createdUser = await user
    .findbyId(user._id)
    .select("-password -refreshtoken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered succesfully"));
});

const loginuser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username or email required ");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const passwordvalid = await user.isPasswordcorrect(password);
  if (!passwordvalid) {
    throw new ApiError(401, "invalid useer credentials");
  }

  const {accesstoken,refreshtoken}=await generateAccessandRefreshtokens(user._id)

  const loggedin=await user.findOne(user._id).select("-password -refreshtoken")

  const options={
    httponly:true,
    secure:true
  }

  return res.status(200).cookie("accestoken",accesstoken,options).cookie("refreshtoken",refreshtoken,options).json(
    new ApiResponse(
      200,{
        user:"loggedinUser,accesstoken,refreshtoken"
      },"User logged In sucesfully"
    )
  )




});

const logoutuser=asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
      req.user._id,{
        $set:{
          refreshtoken:undefined
        }
      },{
        new:true
      },{

      }
    )

    const options={
      httponly:true,
      secure:true
    }

    return res.status(200).clearcookie("accesstoken",options).clearcookie("refreshtoken",options).json(new ApiResponse(200,{},"User loggedout"))


})

export { registeruser, loginuser,logoutuser };
