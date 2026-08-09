import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
} from '../controllers/user.controller.js';
import {
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updatedCoverImage,
    getUserProfileInfo,
    getWatchHistory,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
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

router.route('/login').post(loginUser);

router.route('/logout').post(verifyJwt, logOut);
router.route('/refresh').post(refreshAccessToken);

router.route('/change-password').post(verifyJwt, changeCurrentPassword);

router.route('/update-account').patch(verifyJwt, updateAccountDetails);

router
    .route('/avatar')
    .patch(verifyJwt, upload.single('avatar'), updateUserAvatar);

router.route('/cover-image').patch(
    verifyJwt,
    upload.single({
        name: 'coverImage',
        maxCount: 1,
    }),
    updatedCoverImage,
);

router.route('/profile/:username').get(getUserProfileInfo);

router.route('/watch-history').get(verifyJwt, getWatchHistory);

export default router;
