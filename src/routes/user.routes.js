import { Router } from "express";
import { loginuser,logoutuser,registeruser,refreshAccesstoken, changecurrentpassword, getcurrentuser, updateaccdetails, updateuseravatar, updatecoverimage, getuserchannelprofile, getwatchhistory} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            
        },
        {
            name:"coverimage",
            
        }
    ]),
    
    
    
    
    
    
    registeruser
    )

router.route("/login").post(loginuser)

router.route("/logout").post( verifyJWT , logoutuser)
 
router.route("/refresh-token").post(refreshAccesstoken)

router.route("/change-password").post(verifyJWT,changecurrentpassword)

router.route("/current-user").get(verifyJWT,getcurrentuser)

router.route("/update-account").patch(verifyJWT,updateaccdetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateuseravatar)

router.route("/cover-image").patch(verifyJWT, upload.single("/coverimage"),updatecoverimage)

router.route("/c/:username").get(verifyJWT,getuserchannelprofile)

router.route("/history").get(verifyJWT,getwatchhistory)


export default router