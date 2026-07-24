import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudnary.js';
 import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

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

    console.log(userExist);

    if (userExist) {
        throw new ApiError(400, 'User already exist with username and email');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // let  coverImageLocalPath = req?.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req?.files?.coverImage) &&
        req?.files?.coverImage > 0
    ) {
        coverImageLocalPath = req?.files?.coverImage[0]?.path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, 'avatar is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log(avatar, coverImage);

    if (!avatar) {
        throw new ApiError(400, 'avater file is required');
    }

    const user = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
    });

    if (!user) {
        throw new ApiError(409, 'somthing went wrong');
    }

    const createdUser = await User.findOne(user._id).select(
        '-password -refreshToken',
    );

    res.status(200).json(
        new ApiResponse(201, createdUser, 'User Register succesfully'),
    );
});


const generateAccessAndRefreshToken = async (userId) => {
    const userWithTokens = await User.findOne({
        $or:[{ userId }],
    }).select('-password -refreshToken');

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
console.log(req);

    const { email , password } = req.body

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

    const { userWithTokens, refreshToken, accessToken } =   await generateAccessAndRefreshToken(user._id);
    console.log(refreshToken,accessToken);
    
    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user:  userWithTokens, accessToken, refreshToken 
                },
                'user logedin successfully',
            ),
        );
});


const logOut = asyncHandler(async(req,res)=>{
  const userId=  req.user._id

 await  User.findByIdAndUpdate(
    userId,
    {
        $set:{
            refreshToken:undefined
        }
    },{
        new:true,
    }


)
const options = {
    httpOnly: true,
    secure: true,
};
return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(
    new ApiResponse(200,{},"user logOut successfully")
)
})
export { registerUser, loginUser,logOut };
