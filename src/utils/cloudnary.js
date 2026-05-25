import { v2 as cloudinary } from 'cloudinary';

import fs from 'fs';

cloudinary.config({
	cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
	api_key: process.env.CLOUDNARY_API_KEY,
	api_secret: process.env.CLOUDNARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;

		const response = await cloudinary.v2.uploader.upload(localFilePath, {
			resource_type: 'auto',
		});
		console.log('file is uploaded successfuly', response.url);
		return response;
	} catch (error) {
		fs.unlinkSync(localFilePath);
		return null;
	}
};

export { uploadOnCloudinary };
