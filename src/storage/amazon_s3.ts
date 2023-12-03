import { S3 } from "aws-sdk";
import dotenvconfig from "../config/dotenvconfig";
import * as amazon_s3_type from "../types/amazon_s3_type";

const s3: S3 = new S3({
  credentials: {
    accessKeyId: dotenvconfig.AWS_ACCESS_KEY,
    secretAccessKey: dotenvconfig.AWS_SECRET_ACCESS_KEY,
  },
  region: dotenvconfig.AMAZON_IAM_REGION,
});

export const uploadImageToS3 = async ({
  image,
}: amazon_s3_type.IUploadImageToS3Params): Promise<
  amazon_s3_type.TS3ManagedUpload | undefined
> => {
  const uploadParams: amazon_s3_type.IS3UploadParams = {
    Bucket: dotenvconfig.AMAZON_S3_BUCKET_NAME,
    Key: `${Date.now()}-${image.name.split(" ").join("-")}`,
    Body: image.data,
    ContentType: image.mimetype,
    MetaData: {
      "Content-Disposition": "inline",
    },
  };

  try {
    const uploaded_file: amazon_s3_type.TS3ManagedUpload = await s3
      .upload(uploadParams)
      .promise();

    if (!uploaded_file) return undefined;

    return uploaded_file;
  } catch (e) {
    console.log(`S3 upload error: ${e}`);
  }
};

export const removeImageFromS3 = async ({
  image_key,
}: amazon_s3_type.IUploadedImageKey): Promise<
  amazon_s3_type.TS3DeleteObjectOutput | undefined
> => {
  const params: amazon_s3_type.IRemoveImageFromS3Params = {
    Bucket: dotenvconfig.AMAZON_S3_BUCKET_NAME,
    Key: image_key,
  };

  try {
    return await s3.deleteObject(params).promise();
  } catch (e) {
    console.log(`S3 remove error: ${e}`);
  }
};

export const cloudfrontImageUrl = ({
  cloud_image,
}: amazon_s3_type.ICloudfrontImageUrl): string => {
  const url: string = `${
    dotenvconfig.AMAZON_S3_CLOUDFRONT_DOMAIN_NAME
  }/${cloud_image.Location.split("/").at(-1)}`;

  return url;
};
