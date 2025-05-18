import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.c_name,
    api_key: process.env.ck,
    api_secret: process.env.csk,
  });

  console.log("✅ Cloudinary configured successfully.");
}

configureCloudinary();

export{ cloudinary, configureCloudinary };

