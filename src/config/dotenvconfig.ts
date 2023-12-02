import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  PORT: Number(process.env.PORT || "8000"),
  MONGO_URI: process.env.MONGO_URI as string,
  NODE_ENV: process.env.NODE_ENV as string,
  JWT_ACCESS: process.env.JWT_ACCESS as string,
  JWT_REFRESH: process.env.JWT_REFRESH as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_USER_NAME: process.env.EMAIL_USER_NAME as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
  EMAIL_HOST: process.env.EMAIL_HOST as string,
  EMAIL_PORT: Number(process.env.EMAIL_PORT || "587"),
  EMAIL_SERVICE: process.env.EMAIL_SERVICE as string,
  SUPER_ADMIN: process.env.SUPER_ADMIN as string,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  SITE_URL: process.env.SITE_URL as string,
  CLOUDINARY_USERNAME: process.env.CLOUDINARY_USERNAME as string,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: Number(process.env.REDIS_PORT || "6379"),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AMAZON_S3_BUCKET_NAME: process.env.AMAZON_S3_BUCKET_NAME as string,
  AMAZON_IAM_REGION: process.env.AMAZON_IAM_REGION as string,
  AMAZON_S3_CLOUDFRONT_DOMAIN_NAME: process.env
    .AMAZON_S3_CLOUDFRONT_DOMAIN_NAME as string,
};
