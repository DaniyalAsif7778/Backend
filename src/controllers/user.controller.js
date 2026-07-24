import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { upload } from '../middlewares/multer.middleware.js';
import { ApiResponse } from "../utils/ApiResponse.js"



const generateAccessAndRefreshToken = (userId)=>{
    const user = await User.findOne({
        $or:{userId}
    }).select("-password -refreshToken")

    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()

    user.refreshToken =  refreshToken
    await user.save({validateBeforeSave:false})
    return {user ,refreshToken,accessToken}
}

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



const loginUser = asyncHandler(async(req,res)=>{
    // take input from the user validated the input 
    // check user exsited in the db 
    // generate tokens if existed 
    // if not give them error back 
    // validation but every field error is differ stored an ddisplay ok
    // if accestoken exists give acces 

    const {email,password} =  req.body

    if (!email) {
        throw new ApiError(400 ,"email required for authentication")
        
    }

   const user = await  User.findOne({
        $or:[{email}]
    })

    if (!User) {
        throw new ApiError(400,"User does not exist  ")
    }


   const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid) {
    throw new ApiError(400,"InValid login credentials")
   }

const {user ,refreshToken,accessToken} = await  generateAccessAndRefreshToken(user._id)
const options = {
    httpOnly:true,
    secure:true
}

res.status(200).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options).json(
    new ApiResponse(200,{
        user:[user , accessToken,refreshToken]
    },
"user logedin successfully"
)
)

})

export   {registerUser
    ,loginUser
}