import { v2 as cloudinary } from 'cloudinary';

import fs from 'fs';
import { ApiError } from './ApiError';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
 
    try {
        if (!localFilePath) return;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        console.log('file is uploaded successfuly', response.url);

        fs.unlinkSync(localFilePath);
        console.log(response, 'response errror');

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
};

const updateFromCloudinary = async (filePath,publicId) => {
	try {
		if(!(filePath && publicId) ) return ;
		const response = await cloudinary.api.Upload(filePath,{
			public_id: publicId,
			overwrite:true,
			invalidate:true,
		})

		return response?.url;
	} catch (error) {
		throw new ApiError(404,` !ok while replacing on cloudinary ${error}`)
	}
};

const deleteFromCloudinary = async (publicIdsArray) => {
    try {
        if (!localFilePath) return;

        const response = await cloudinary.api.delete_resources(publicIdsArray);
        return response;
    } catch (error) {
        throw new ApiError(
            404,
            'Somthing went wrong while deleting the cloudinary pic',
        );
    }
};

export { uploadOnCloudinary, deleteFromCloudinary,updateFromCloudinary };
