import { Router } from 'express';
import { registerUser, loginUser,logOut,refreshAccessToken,changeUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import {verifyJwt} from "../middlewares/auth.middleware.js" 
const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1,
        },
        {
            name: 'coverImage',
            maxCount: 1,
        },
    ]),
    registerUser,
);

router.route('/login').post(loginUser) 

router.route('/logout').post(verifyJwt,logOut)
router.route('/refresh').post(refreshAccessToken)
router.route("/update-email").patch(verifyJwt,changeUser)
router.route("/update-password").patch(verifyJwt,changeUser)

export default router;
