import express from "express";
import { UploadedFile } from "express-fileupload";
import { IClearCookie, ISaveCookie } from "../types/cookie_config_type";

export type TImageErrorResponse = express.Response<any, Record<string, any>>;

export const responseSuccessData = (
  res: express.Response,
  status: number = 400,
  data: object | object[]
): express.Response => {
  return res.status(status).json(data);
};

export const responseErrorMessages = (
  res: express.Response,
  status: number = 400,
  data: {
    errors: object;
  }
): express.Response => {
  return res.status(status).json(data);
};

export const responseErrorMessage = (
  res: express.Response,
  status: number = 400,
  data: {
    error: string;
  }
): express.Response => {
  return res.status(status).json(data);
};

export const responseSuccessMessage = (
  res: express.Response,
  status: number = 400,
  data: {
    message: string;
  }
): express.Response => {
  return res.status(status).json(data);
};

export const responseImageErrorMessage = async (
  res: express.Response,
  image: UploadedFile | undefined
): Promise<TImageErrorResponse | undefined> => {
  const fileTypes: string[] = ["image/jpeg", "image/png", "image/jpg"];
  const image_size: number = 1024;

  if (!image) {
    return responseErrorMessage(res, 400, {
      error: "Please upload an image!",
    });
  }

  if (Array.isArray(image)) {
    return responseErrorMessage(res, 400, {
      error: "Multiple image uploads are not allowed!",
    });
  }

  if (!fileTypes.includes(image.mimetype)) {
    return responseErrorMessage(res, 400, {
      error: "Supported image formats: JPG, PNG, JPEG",
    });
  }

  if (image.size / 1024 > image_size) {
    return responseErrorMessage(res, 400, {
      error: `Image should be less than: ${image_size}kb or 1mb`,
    });
  }

  // No errors found, return undefined (no response)
  return undefined;
};

export const responseSuccessDataAndSaveCookie = (
  res: express.Response,
  cookie_token_value: string,
  cookie_config: ISaveCookie,
  status: number = 200,
  document: object
) => {
  return res
    .cookie(cookie_config.cookie_token, cookie_token_value, {
      ...cookie_config.cookie_options,
      sameSite: "none",
    })
    .status(status)
    .json(document);
};

export const responseSuccessMessageAndClearCookie = (
  res: express.Response,
  cookie_config: IClearCookie,
  status: number = 200,
  data: { message: string }
) => {
  return res
    .clearCookie(cookie_config.cookie_token, {
      ...cookie_config.cookie_options,
      sameSite: "none",
    })
    .status(status)
    .json(data);
};
