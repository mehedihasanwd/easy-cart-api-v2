import dotenvconfig from "../config/dotenvconfig";
import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { sendMail } from "../utils/mailer";
import { IUserPayload } from "./../types/user_and_staff/payload_type";
import { THydratedUserDocument } from "../types/user/user_document_type";
import { errorReducer } from "./../utils/error_reducer";
import { isValidParamsId } from "../utils/is_valid_params_id";
import { IEmailBody } from "../types/email_type";
import { UploadedFile } from "express-fileupload";
import { extractUserData } from "../utils/document_extractor";
import * as tokens from "../utils/token";
import * as responses from "../utils/response";
import * as cookie_config from "../utils/cookie_config";
import * as user_services from "../services/user_services";
import * as order_services from "../services/order_services";
import * as review_services from "../services/review_services";
import * as user_request_data_validators from "../validators/user_controllers_request_data_validator";
import * as amazon_s3 from "../storage/amazon_s3";
import * as amazon_s3_type from "../types/amazon_s3_type";
import * as email_template from "../utils/email_template";
import { THydratedReviewDocument } from "../types/review/review_document_type";
import { THydratedOrderDocument } from "../types/order/order_document_type";

export const verifyUserEmail: RequestHandler = async (req, res, next) => {
  const { value, error } =
    user_request_data_validators.verify_email_validate_schema.validate(
      {
        name: req.body?.name,
        email: req.body?.email,
        password: req.body?.password,
      },
      {
        abortEarly: false,
      }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: { errors: errorReducer(error.details) },
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "email", value: value.email });

    if (user) {
      const is_match_password: boolean =
        await user_services.isMatchUserPassword({
          password: value.password,
          user,
        });

      if (!is_match_password) {
        return responses.responseErrorMessage(res, 400, {
          error:
            "User already exists! please try again using a different email or login",
        });
      }

      const { access_token, refresh_token } =
        await user_services.createUserAuthTokens({ user });

      const { data_except_password } = extractUserData({
        document: user,
      });

      return responses.responseSuccessDataAndSaveCookie(
        res,
        refresh_token,
        cookie_config.save_cookie_data,
        201,
        {
          message: "Logged in successfully",
          access_token,
          user: data_except_password,
        }
      );
    }

    const access_token: string = tokens.accountRegistrationToken({
      payload: value,
      expiresIn: "15m",
    });

    const email_body: IEmailBody = email_template.registerUserEmailTemplate({
      emailTo: value.email,
      receiverName: value.name,
      access_token,
    });

    const message: string = `E-mail has been sent to: ${value.email}. Follow the instructions to complete registration.`;
    sendMail(res, email_body, message);
  } catch (e) {
    return next(e);
  }
};

export const postRegisterUser: RequestHandler = async (req, res, next) => {
  const { value, error } =
    user_request_data_validators.register_user_validate_schema.validate({
      token: req.body?.token,
    });

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    jwt.verify(
      value.token as string,
      dotenvconfig.JWT_ACCESS as string,
      async (
        err: jwt.VerifyErrors | null,
        decoded: string | jwt.JwtPayload | undefined
      ) => {
        if (err) {
          return responses.responseErrorMessage(res, 401, {
            error:
              "Invalid token or expired! please try again using a valid token",
          });
        }

        const decoded_user = decoded as {
          name: string;
          email: string;
          password: string;
        };

        const user: THydratedUserDocument | null =
          await user_services.findUserByProp({
            key: "email",
            value: decoded_user.email,
          });

        if (user) {
          const is_match_password: boolean =
            await user_services.isMatchUserPassword({
              password: decoded_user.password,
              user,
            });

          if (!is_match_password) {
            return responses.responseErrorMessage(res, 400, {
              error:
                "User already exists! please try again using a different email or login",
            });
          }

          const { access_token, refresh_token } =
            await user_services.createUserAuthTokens({ user });

          const { data_except_password } = extractUserData({ document: user });

          return responses.responseSuccessDataAndSaveCookie(
            res,
            refresh_token,
            cookie_config.save_cookie_data,
            200,
            {
              message: "Logged in successfully",
              access_token,
              user: data_except_password,
            }
          );
        }

        const new_user: THydratedUserDocument | null =
          await user_services.createNewUser({ data: decoded_user });

        if (!new_user) {
          return responses.responseErrorMessage(res, 500, {
            error: "Server error occurred! please try again",
          });
        }

        const { data_except_password } = extractUserData({
          document: new_user,
        });

        const { access_token, refresh_token } =
          await user_services.createUserAuthTokens({ user: new_user });

        return responses.responseSuccessDataAndSaveCookie(
          res,
          refresh_token,
          cookie_config.save_cookie_data,
          200,
          {
            message: "Registered successfully",
            access_token,
            user: data_except_password,
          }
        );
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const postLoginUser: RequestHandler = async (req, res, next) => {
  const { value, error } =
    user_request_data_validators.login_user_schema.validate(
      { email: req.body?.email, password: req.body?.password },
      {
        abortEarly: false,
      }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "email", value: value.email });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const is_match_password: boolean = await user_services.isMatchUserPassword({
      password: value.password,
      user,
    });

    if (!is_match_password) {
      return responses.responseErrorMessage(res, 400, {
        error: "Password does not match!",
      });
    }

    const { access_token, refresh_token } =
      await user_services.createUserAuthTokens({ user });

    const { data_except_password } = extractUserData({ document: user });

    return responses.responseSuccessDataAndSaveCookie(
      res,
      refresh_token,
      cookie_config.save_cookie_data,
      200,
      {
        message: "Logged in successfully",
        access_token,
        user: data_except_password,
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const postLogoutUser: RequestHandler = async (req, res, next) => {
  const refresh_token: string = req.cookies?.refresh_token;

  if (!refresh_token) {
    return responses.responseErrorMessage(res, 401, { error: "Unauthorized!" });
  }

  try {
    return responses.responseSuccessMessageAndClearCookie(
      res,
      cookie_config.clear_cookie_data,
      200,
      { message: "Logged out successfully" }
    );
  } catch (e) {
    return next(e);
  }
};

export const getNewRefreshToken: RequestHandler = async (req, res, next) => {
  const refresh_token: string = req.cookies?.refresh_token as string;

  if (!refresh_token) {
    return responses.responseErrorMessage(res, 401, { error: "Unauthorized!" });
  }

  try {
    jwt.verify(
      refresh_token,
      dotenvconfig.JWT_REFRESH as string,
      async (err, decoded) => {
        if (err) {
          return responses.responseErrorMessage(res, 401, {
            error:
              "Invalid token or expired! please try again using a valid token",
          });
        }

        const decoded_user = decoded as IUserPayload;
        const user: THydratedUserDocument | null =
          await user_services.findUserByProp({
            key: "_id",
            value: decoded_user._id,
          });

        if (!user) {
          return responses.responseErrorMessage(res, 404, {
            error: "User not found!",
          });
        }

        const { access_token } = await user_services.createUserAuthTokens({
          user,
        });

        return responses.responseSuccessData(res, 200, { access_token });
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const getUsers: RequestHandler = async (req, res, next) => {
  const current_page: number = Number(req.query.page || "1");
  const limit: number = Number(req.query.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const users: Array<THydratedUserDocument> | null =
      await user_services.findUsers({ skip, limit });

    if (!users) {
      return responses.responseErrorMessage(res, 404, {
        error: "Users not found!",
      });
    }

    const total_users: number = await user_services.countUsers();
    const total_pages: number = Math.ceil(total_users / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      users,
    });
  } catch (e) {
    return next(e);
  }
};

export const postForgotPassword: RequestHandler = async (req, res, next) => {
  const { value, error } =
    user_request_data_validators.forgot_password_schema.validate(
      { email: req.body?.email },
      {
        abortEarly: false,
      }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "email", value: value.email });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const access_token: string = tokens.resetAccountPasswordToken({
      payload: { email: value.email },
      expiresIn: "15m",
    });

    const email_body: IEmailBody =
      email_template.resetAccountPassworEmailTemplate({
        emailTo: value.email,
        receiverName: user.name,
        access_token,
      });

    const message: string = `E-mail has been sent to ${value.email}. Please follow the instructions to your reset your password.`;
    sendMail(res, email_body, message);
  } catch (e) {
    return next(e);
  }
};

export const patchResetPassword: RequestHandler = async (req, res, next) => {
  const { value, error } =
    user_request_data_validators.reset_password_schema.validate(
      {
        token: req.body?.token,
        new_password: req.body?.new_password,
      },
      { abortEarly: false }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    jwt.verify(
      value.token as string,
      dotenvconfig.JWT_ACCESS as string,
      async (
        err: jwt.VerifyErrors | null,
        decoded: string | jwt.JwtPayload | undefined
      ) => {
        if (err) {
          return responses.responseErrorMessage(res, 401, {
            error:
              "Invalid token or expired! please try again using a valid token",
          });
        }

        const decoded_user = decoded as { email: string };
        const user: THydratedUserDocument | null =
          await user_services.findUserByProp({
            key: "email",
            value: decoded_user.email,
          });

        if (!user) {
          return responses.responseErrorMessage(res, 404, {
            error: "User not found!",
          });
        }

        const updated_user: THydratedUserDocument | null =
          await user_services.updateUserPassword({
            new_password: value.new_password,
            user,
          });

        if (!updated_user) {
          return responses.responseErrorMessage(res, 500, {
            error: "Server error occurred! please try again",
          });
        }

        const { access_token, refresh_token } =
          await user_services.createUserAuthTokens({ user: updated_user });

        const { data_except_password } = extractUserData({
          document: updated_user,
        });

        return responses.responseSuccessDataAndSaveCookie(
          res,
          refresh_token,
          cookie_config.save_cookie_data,
          200,
          {
            message: "Updated successfully",
            access_token,
            user: data_except_password,
          }
        );
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const patchChangePassword: RequestHandler = async (req, res, next) => {
  const { value, error } =
    user_request_data_validators.change_password_schema.validate(
      {
        email: req.body?.email,
        password: req.body?.password,
        new_password: req.body?.new_password,
      },
      { abortEarly: false }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "email", value: value.email });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const is_match_password: boolean = await user_services.isMatchUserPassword({
      password: value.password,
      user,
    });

    if (!is_match_password) {
      return responses.responseErrorMessage(res, 400, {
        error: "Password does not match!",
      });
    }

    const updated_user: THydratedUserDocument | null =
      await user_services.updateUserPassword({
        user,
        new_password: value.new_password,
      });

    if (!updated_user) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const { data_except_password } = extractUserData({
      document: updated_user,
    });

    return responses.responseSuccessData(res, 200, {
      message: "Password changed successfully",
      user: data_except_password,
    });
  } catch (e) {
    return next(e);
  }
};

export const getUserById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.userId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "_id", value: _id });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const { data_except_password } = extractUserData({ document: user });

    return responses.responseSuccessData(res, 200, {
      user: data_except_password,
    });
  } catch (e) {
    return next(e);
  }
};

export const patchUserProfileImageById: RequestHandler = async (
  req,
  res,
  next
) => {
  const _id: string = req.params?.userId;
  const image: UploadedFile = req.files?.image as UploadedFile;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "_id", value: _id });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    responses.responseImageErrorMessage(res, image);

    if (user.image.isChangedSelf) {
      await amazon_s3.removeImageFromS3({ image_key: user.image.key });
    }

    const cloud_image: amazon_s3_type.TS3ManagedUpload | undefined =
      await amazon_s3.uploadImageToS3({ image });

    if (!cloud_image) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    const updated_user: THydratedUserDocument | null =
      await user_services.updateUserImageById({
        _id,
        image: {
          isChangedSelf: true,
          key: cloud_image.Key,
          url: amazon_s3.cloudfrontImageUrl({ cloud_image }),
        },
      });

    if (!updated_user) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const { data_except_password } = extractUserData({
      document: updated_user,
    });

    const reviews_by_user_id: Array<THydratedReviewDocument> | null =
      await review_services.findReviewsByProp({
        key: "user_id",
        value: user._id,
      });

    if (reviews_by_user_id) {
      await review_services.updateUserImageById({
        _id,
        image: {
          key: data_except_password.image.key,
          url: data_except_password.image.url,
        },
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Image updated successfully",
      staff: data_except_password,
    });
  } catch (e) {
    return next(e);
  }
};

export const putUserById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.userId;
  const { value, error } =
    user_request_data_validators.update_user_validator_schema.validate(
      {
        name: req.body?.name,
        gender: req.body?.gender,
        phone: req.body?.phone,
        country: req.body?.country,
        city: req.body?.city,
        house_number_or_name: req.body?.house_number_or_name,
        post_code: req.body?.post_code,
      },
      {
        abortEarly: false,
      }
    );

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "_id", value: _id });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const updated_user: THydratedUserDocument | null =
      await user_services.updateUserById({ _id, data: value });

    if (!updated_user) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const { access_token, refresh_token } =
      await user_services.createUserAuthTokens({ user: updated_user });
    const { data_except_password } = extractUserData({
      document: updated_user,
    });

    if (user.name !== value.name) {
      const reviews_by_user_id: Array<THydratedReviewDocument> | null =
        await review_services.findReviewsByProp({
          key: "user_id",
          value: user._id,
        });

      reviews_by_user_id &&
        (await review_services.updateUserNameById({
          _id,
          user_name: value.name,
        }));
    }

    return responses.responseSuccessDataAndSaveCookie(
      res,
      refresh_token,
      cookie_config.save_cookie_data,
      200,
      {
        message: "Updated successfully",
        access_token,
        user: data_except_password,
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const deleteUserById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.userId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "_id", value: _id });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const user_order: THydratedOrderDocument | null =
      await order_services.findOrderByProp({
        key: "user_id",
        value: user._id.toString(),
      });

    const order_statuses: string[] = ["pending", "processing", "shipped"];

    if (user_order && order_statuses.includes(user_order.status)) {
      return responses.responseErrorMessage(res, 400, {
        error: "Can not delete account with active order/s!",
      });
    }

    if (user.image.isChangedSelf) {
      await amazon_s3.removeImageFromS3({ image_key: user.image.key });
    }
    await user_services.removeUserById({ _id });

    return responses.responseSuccessMessageAndClearCookie(
      res,
      cookie_config.clear_cookie_data,
      200,
      { message: "Deleted successfully" }
    );
  } catch (e) {
    return next(e);
  }
};
