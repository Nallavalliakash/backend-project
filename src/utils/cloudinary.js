import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "process.env.CLOUDINARY_CLOUD_NAME",
  api_key: "process.env.CLOUDINARY_API_KEY",
  api_secret: "process.env.CLOUDINARY_API_SECRET",
});

const uploadcloudinaryfile = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cloudinary",response.url);
    return response;

    return response;
  } catch (error) {
    fs.unlinkSync(localfilepath);
    return null;
  }
};

const deleteOnCloudinary = async (public_id, resource_type="image") => {
  try {
      if (!public_id) return null;

      //delete file from cloudinary
      const result = await cloudinary.uploader.destroy(public_id, {
          resource_type: `${resource_type}`
      });
  } catch (error) {
      return error;
      console.log("delete on cloudinary failed", error);
  }
};

export { uploadcloudinaryfile,deleteOnCloudinary};
