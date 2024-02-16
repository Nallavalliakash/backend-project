import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadcloudinaryfile } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshtokens = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accesstoken = user.generateAccesstoken();
    const refreshtoken = user.generateRefreshtoken();

    user.refreshtoken = refreshtoken;
    user.save({ validateBeforesSave: false });

    return { accesstoken, refreshtoken };
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

  if (!existedUser) {
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
  if (!(username || email)) {
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

  const { accesstoken, refreshtoken } = await generateAccessandRefreshtokens(
    user._id
  );

  const loggedin = await user
    .findOne(user._id)
    .select("-password -refreshtoken");

  const options = {
    httponly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accestoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: "loggedinUser,accesstoken,refreshtoken",
        },
        "User logged In sucesfully"
      )
    );
});

const logoutuser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: undefined,
      },
    },
    {
      new: true,
    },
    {}
  );

  const options = {
    httponly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearcookie("accesstoken", options)
    .clearcookie("refreshtoken", options)
    .json(new ApiResponse(200, {}, "User loggedout"));
});

const refreshAccesstoken = asynchandler(async (req, res) => {
  const incomingrefreshtoken =
    req.cookies.refreshtoken || req.body.refreshtoken;
  if (!incomingrefreshtoken) {
    throw new ApiError(401, "Unauthorised request");
  }

  try {
    const decodedtoken = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findbyId(decodedtoken?._id);
    if (!decodedtoken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingrefreshtoken !== user?.refreshtoken) {
      throw new ApiError(401, "Refresh token is expired ");
    }

    const options = {
      httponly: true,
      secure: true,
    };

    const { accesstoken, newrefreshtoken } =
      await generateAccessandRefreshtokens(user._id);

    return res
      .status(200)
      .cookie("accesstoken", accesstoken, options)
      .cookie("refreshtoken", newrefreshtoken, options)
      .json(
        new ApiResponse(
          200,
          { accesstoken, refreshtoken: newrefreshtoken },
          "Acess token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const changecurrentpassword = asynchandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;
  const user = await user.findById(req.user?._id);
  const isPasswordcorrect = await user.isPasswordcorrect(oldpassword);
  if (!isPasswordcorrect) {
    throw new ApiError(400, "Invalid Password");
  }
  user.password = newpassword;
  await user.save({ validateBeforesSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "password changed succesfully"));
});

const getcurrentuser = asynchandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "user fetched successfully"));
});

const updateaccdetails = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname || !email) {
    throw new ApiError(400, "all fields are required ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User details updated succesfully"));
});

const updateuseravatar = asynchandler(async (req, res) => {
  const avatarlocalpath = req.file?.path;
  if (!avatarlocalpath) {
    throw new ApiError(400, "avatar file is missing");
  }
  const avatar = await uploadcloudinaryfile(avatarlocalpath);
  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    )
    .select("-password");

  return res.status(200).json(new ApiResponse(200, user, "avatar updated"));
});

const updatecoverimage = asynchandler(async (req, res) => {
  const coverimagelocalpath = req.file?.path;
  if (!coverimagelocalpath) {
    throw new ApiError(400, "coverimage file is missing");
  }
  const coverimage = await uploadcloudinaryfile(coverimagelocalpath);
  if (!coverimage.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await user
    .findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverimage: coverimage.url,
        },
      },
      { new: true }
    )
    .select("-password");

  return res.status(200).json(new ApiResponse(200, user, "coverimage updated"));
});

const getuserchannelprofile=asynchandler(async(req,res)=>{
const{username}=req.params
if (!username?.trim()) {
  throw new ApiError(400,"username is missing")
}

const channel=await User.aggregate([
  {
    $match:{
      username:username?.toLowercase()
    },
    $lookup:{
      from:"subscribers",
      localField:"_id",
      foreignField:"channel",
      as:"subscribers"
    },
    $lookup:{
      from:"subscribers",
      localField:"_id",
      foreignField:"subsriber",
      as:"subscribedto"
    }
  },
  {
    $addFields:{
      subscriberscount:{
        $size:"$subscribers"
      },
      channelsubscribetocount:{
        $size:"$subscribedto"
      },
      issubscribded:{
        $cond:{
          if:{$in:[req.user?._id,"$subscribers.subsriber"]},
          then:true,
          else:false
        }
      }
    }
  },
  {
    $project:{
      fullname:1,
      username:1,
      subscriberscount:1,
      channelsubscribetocount:1,
      issubscribded:1,
      avatar:1,
      coverimage:1,
      email:1


    }
  }
])

if (!channel?.length()) {
  throw new ApiError(404,"channel does not exist")
}

return res.status(200).json(new ApiResponse(200,channel[0],"user channel fetched succesfully"))
})

const getwatchhistory=asynchandler(async(req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.objectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"Video",
        localField:"watchhistory",
        foreignField:"_id",
        as:"watchhistory",
        pipeline:[
          {
            $lookup:{
              from:"Video",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ]
      }
    }
  ])
  return res.status(200).json(new ApiResponse(200,user[0].watchhistory,"watch history fetched succesfully"))
})






export {
  registeruser,
  loginuser,
  logoutuser,
  refreshAccesstoken,
  changecurrentpassword,
  getcurrentuser,
  updateaccdetails,
  updateuseravatar,
  updatecoverimage,
  getuserchannelprofile,
  getwatchhistory
};
