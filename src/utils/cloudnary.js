import { v2 as cloudinary } from 'cloudinary';
import process from 'process';
import fs from 'fs';
import { ApiError } from './ApiError.js';
import {getCloudinaryPublicId} from "./getCloudinaryPublicId.js";

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
        return error;
    }
};

const updateFromCloudinary = async (filePath, publicId) => {
    try {
        if (!(filePath && publicId)) return;
      const trimPublicId =  getCloudinaryPublicId(publicId)
        console.log('localpath', filePath, 'publicID ', trimPublicId);
        const response = await cloudinary.uploader.upload(filePath, {
            public_id: trimPublicId,
            overwrite: true,
            invalidate: true,
        });
        fs.unlinkSync(filePath);
          console.log(response);
          
        return response ;
    } catch (error) {
        fs.unlinkSync(filePath);

        throw new ApiError(404, ` !ok while replacing on cloudinary ${error}`);
    }
};

const deleteFromCloudinary = async (publicIdsArray) => {
    try {
        if (!publicIdsArray) return;

        const response =
            await cloudinary.uploader.delete_resources(publicIdsArray);

        return response;
    } catch (error) {
        throw new ApiError(
            404,
            ` Somthing went wrong while deleting the cloudinary pic ${error}`,
        );
    }
};

export { uploadOnCloudinary, deleteFromCloudinary, updateFromCloudinary };
