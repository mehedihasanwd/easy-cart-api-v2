import { UploadedFile } from "express-fileupload";
import { S3 } from "aws-sdk";

export interface IS3UploadParams {
  Bucket: string;
  Key: string;
  Body: Buffer;
  ContentType: string;
  MetaData: {
    "Content-Disposition": string;
  };
}

export interface IRemoveImageFromS3Params {
  Bucket: string;
  Key: string;
}

export interface IUploadImageToS3Params {
  image: UploadedFile;
}

export interface IUploadedImageKey {
  image_key: string;
}

export type TS3ManagedUpload = S3.ManagedUpload.SendData;
export type TS3DeleteObjectOutput = S3.DeleteObjectOutput;

export interface ICloudfrontImageUrl {
  cloud_image: TS3ManagedUpload;
}
