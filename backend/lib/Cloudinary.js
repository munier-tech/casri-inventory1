// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dzeznfc99",
  api_key: process.env.CLOUDINARY_API_KEY || "499952982913397",
  api_secret: process.env.CLOUDINARY_API_SECRET || "1N02Ht_ygu2uLp9zGIy5FRNo9PM"
});

export default cloudinary;
