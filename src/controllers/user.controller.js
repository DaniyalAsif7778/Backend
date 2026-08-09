import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import {
    uploadOnCloudinary,
    updateFromCloudinary,
} from '../utils/cloudnary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;
    console.log(fullName, email, username, password);

    if (
        [fullName, email, password, username].some(
            (field) => field?.trim() === '',
        )
    ) {
        throw new ApiError(400, 'fill all fields ');
    }

    const userExist = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (userExist) {
        throw new ApiError(400, 'User already exist with username and email');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // let  coverImageLocalPath = req?.files?.coverImage[0]?.path
    console.log(req.files?.coverImage[0]?.path);

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req?.files?.coverImage) &&
        req?.files?.coverImage.length >= 0
    ) {
        coverImageLocalPath = req?.files?.coverImage[0]?.path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, 'avatar is required');
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: '',
        coverImage: '',
    });

    if (!user) {
        throw new ApiError(409, 'somthing went wrong');
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, 'avater file is required');
    }
    const createdUser = await User.findOneAndUpdate(
        user._id,
        { $set: { avatar: avatar.url, coverImage: coverImage?.url || '' } },
        { validateBeforeSave: false },
    ).select('-password -refreshToken');
    ('-password -refreshToken',
        res
            .status(200)
            .json(
                new ApiResponse(201, createdUser, 'User Register succesfully'),
            ));
});

const generateAccessAndRefreshToken = async (userId) => {
    const userWithTokens = await User.findById(userId).select(
        '-password -refreshToken',
    );

    const refreshToken = userWithTokens.generateRefreshToken();
    const accessToken = userWithTokens.generateAccessToken();

    userWithTokens.refreshToken = refreshToken;
    await userWithTokens.save({ validateBeforeSave: false });
    return { userWithTokens, refreshToken, accessToken };
};

const loginUser = asyncHandler(async (req, res) => {
    // take input from the user validated the input
    // check user exsited in the db
    // generate tokens if existed
    // if not give them error back
    // validation but every field error is differ stored an ddisplay ok
    // if accestoken exists give acces

    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, 'email required for authentication');
    }

    const user = await User.findOne({
        $or: [{ email }],
    });

    if (!user) {
        throw new ApiError(400, 'User does not exist  ');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, 'InValid login credentials');
    }

    const { userWithTokens, refreshToken, accessToken } =
        await generateAccessAndRefreshToken(user._id);
    console.log(refreshToken, accessToken);

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    };

    res.status(200)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: userWithTokens,
                    accessToken,
                    refreshToken,
                },
                'user logedin successfully',
            ),
        );
});

const logOut = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log(userId, 'userId');

    const user = await User.findByIdAndUpdate(
        userId,
        {
            refreshToken: null,
        },
        {
            returnDocument: 'after',
            runValidators: true, // Validate the data against schema rules
        },
    );
    console.log(user, 'user1');

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    };
    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'user logOut successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const token =
        req.cookies?.refreshToken ||
        req.header('Authorization').replace('Bearer ', '');
    console.log(token);
    if (!token) {
        throw new ApiError(400, 'unathorized request');
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    console.log(decodedToken);
    if (!decodedToken) {
        throw new ApiError(400, 'Invalid accessToken');
    }

    const userId = decodedToken?._id;
    console.log(userId, 'userid');

    const user = await User.findById(userId);
    console.log(user, 'user1');
    if (user.refreshToken !== token) {
        throw new ApiError(400, 'Invalid refreshToken');
    }

    const { userWithTokens, accessToken, refreshToken } =
        await generateAccessAndRefreshToken(userId);

    console.log(userWithTokens, accessToken, refreshToken);

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    };
    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(
                201,

                {
                    user: userWithTokens,
                    accessToken,
                    refreshToken,
                },
            ),
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) {
        throw new ApiError(400, 'provide the changed field');
    }
    const userId = req.user?._id;

    const user = await User.findOneAndUpdate(
        userId,
        { $set: { password: password } },
        { validateBeforeSave: false },
    ).select('-password -refreshToken');

    res.status(200).json(
        new ApiResponse(
            201,
            {
                user: user,
            },
            'password updated successfully',
        ),
    );
    if (!user) {
        throw new ApiError(400, 'unAthorized Request');
    }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email && !password) {
        throw new ApiError(400, 'fill all fields');
    }

    const userId = req.user?._id;

    const user = await User.findOneAndUpdate(
        userId,
        { $set: { email: email, password: password } },
        { validateBeforeSave: false },
    ).select('-password -refreshToken');

    res.status(200).json(
        new ApiResponse(
            201,
            {
                user: user,
            },
            'password updated successfully',
        ),
    );
    if (!user) {
        throw new ApiError(400, 'unAthorized Request');
    }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(400, 'unAthorized request');
    }
    const avatarLoalPath = req.file?.avatar[0].path;

    if (!avatarLoalPath) {
        throw new ApiError(404, 'local path does not find avatar');
    }
    const avatar = await updateFromCloudinary(avatarLoalPath, user?.avatar);
    user.avatar = avatar;
    user.save({ validateBeforeSave: false });

    return res.status(200).json(
        201,
        {
            user: user,
        },
        'avater successfuly updated',
    );
});
const updatedCoverImage = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(400, 'unAthorized request');
    }

    const coverImageLoalPath = req.file?.coverImage[0].path;
    if (!coverImageLoalPath) {
        throw new ApiError(404, 'local path doesnot find coverImage');
    }
    const coverImage = await updateFromCloudinary(
        coverImageLoalPath,
        user?.coverImage,
    );
    user.coverImage = coverImage;
    user.save({ validateBeforeSave: false });

    return res.status(200).json(
        201,
        {
            user: user,
        },
        'avater successfuly updated',
    );
});

const getUserProfileInfo = asyncHandler(async (req, res) => {
    const { username } = req.param;

    if (!username) {
        throw new ApiError(400, 'requested data is not found');
    }

    const channel = await User.aggregate([
        {
            $match: { username },
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers',
            },
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo',
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: '$subscribers',
                },
                channelSubscribedToCount: {
                    $size: '$subscribedTo',
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
            },
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, 'something went wrong');
    }

    return res.status(200).json(
        new ApiResponse(
            201,
            {
                channelProfile: channel[0],
            },
            'get channel profile successfuly',
        ),
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(400, 'unAthorized request');
    }

    const watchHistory = User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'history',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                        },
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner',
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            201,
            {
                userWatchHistory: watchHistory[0].watchHistory,
            },
            'get user watchHistory successfuly',
        ),
    );
});
export {
    registerUser,
    loginUser,
    logOut,
    refreshAccessToken,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updatedCoverImage,
    getUserProfileInfo,
    getWatchHistory,
};
