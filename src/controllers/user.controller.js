import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { upload } from '../middlewares/multer.middleware.js';
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

    if (
        [fullName, email, password, username,  ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "fill all fields ")

    }

    const userExist = await User.findOne({
        $or: [{ username }, { email }]
    }

    )

console.log(userExist);

    if (userExist) {
        throw new ApiError(400, "User already exist with username and email")
    };

    const avatarLocalPath = req.files?.avatar[0]?.path
    // let  coverImageLocalPath = req?.files?.coverImage[0]?.path
  let coverImageLocalPath;
  if (req.files && Array.isArray(req?.files?.coverImage) &&  req?.files?.coverImage > 0 ) {
    coverImageLocalPath = req?.files?.coverImage[0]?.path
  }
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required")
    }

    const avatar = await  uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatar,coverImage);

    if (!avatar) {
        throw new ApiError(400, "avater file is required")
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    if (!user) {
        throw new ApiError(409, "somthing went wrong")
    }
 
    const createdUser = await  User.findOne(user._id).select(
        "-password -refreshToken"
    )
 
    res.status(200).json(
       new  ApiResponse(201, createdUser, "User Register succesfully")
    ) 




})

export default registerUser