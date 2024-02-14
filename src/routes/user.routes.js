import { Router } from "express";
import { loginuser,logoutuser,registeruser,refreshAccesstoken} from "../controllers/user.controller.js";
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


export default router