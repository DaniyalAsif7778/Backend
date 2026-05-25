import mongoose, { model, Schema } from 'mongoose';

const userSchema = new Schema(
	{
		username: {
			type: String,
			lowerCase: true,
			required: true,
			unique: true,
			trim: true,
			index: true,
		},
		email: {
			type: String,
			lowerCase: true,
			required: true,
			unique: true,
			trim: true,
		},
		fullName: {
			type: String,
			lowerCase: true,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			lowerCase: true,
			unique: true,
			trim: true,
		},
		avatar: {
			type: String, //cloudnery url
			required: true,
		},
		coverImage: {
			type: String,
		},

		watchHistory: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Videos',
			},
		],
		refreshToken: {
			type: String,
		},
	},
	{ timestamps: true },
);

userSchema.pre('save', function (next) {
	if (!this.isModified('password')) return next();
	this.password = this.bcrypt.hash(this.password);
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			fullName: this.fullName,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		},
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		},
	);
};

export const User = mongoose.model('User', userSchema);
