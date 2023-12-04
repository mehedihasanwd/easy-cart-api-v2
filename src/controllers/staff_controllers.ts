import dotenvconfig from "../config/dotenvconfig";
import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { IStaffPayload } from "./../types/user_and_staff/payload_type";
import { THydratedStaffDocument } from "../types/staff/staff_document_type";
import { errorReducer } from "./../utils/error_reducer";
import { isValidParamsId } from "../utils/is_valid_params_id";
import { IEmailBody } from "../types/email_type";
import { UploadedFile } from "express-fileupload";
import { extractStaffData } from "../utils/document_extractor";
import * as mailer from "../utils/mailer";
import * as tokens from "../utils/token";
import * as responses from "../utils/response";
import * as cookie_config from "../utils/cookie_config";
import * as staff_services from "../services/staff_services";
import * as staff_request_data_validators from "../validators/staff_controllers_request_data_validator";
import * as amazon_s3 from "../storage/amazon_s3";
import * as amazon_s3_type from "../types/amazon_s3_type";
import * as email_template from "../utils/email_template";

export const verifyStaffEmail: RequestHandler = async (req, res, next) => {
  const { value, error } =
    staff_request_data_validators.verify_email_validate_schema.validate(
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
      errors: errorReducer(error.details),
    });
  }

  try {
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({
        key: "email",
        value: value.email,
      });

    if (staff) {
      const is_match_password: boolean =
        await staff_services.isMatchStaffPassword({
          password: value.password,
          staff,
        });

      if (!is_match_password) {
        return responses.responseErrorMessage(res, 400, {
          error:
            "Staff already exists! please try again using a different email or login",
        });
      }

      const { access_token, refresh_token } =
        await staff_services.createStaffAuthTokens({ staff });

      const { data_except_password } = extractStaffData({
        document: staff,
      });

      return responses.responseSuccessDataAndSaveCookie(
        res,
        refresh_token,
        cookie_config.save_cookie_data,
        201,
        {
          message: "Logged in successfully",
          access_token,
          staff: data_except_password,
        }
      );
    }

    const access_token: string = tokens.accountRegistrationToken({
      payload: value,
      expiresIn: "15m",
    });

    const email_body: IEmailBody = email_template.registerStaffEmailTemplate({
      emailTo: value.email,
      receiverName: value.name,
      access_token,
    });

    const message: string = `E-mail has been sent to: ${value.email}. Follow the instructions to complete registration.`;
    mailer.sendMail(res, email_body, message);
  } catch (e) {
    return next(e);
  }
};

export const postRegisterNewStaff: RequestHandler = async (req, res, next) => {
  const { value, error } =
    staff_request_data_validators.register_staff_token_validate_schema.validate(
      {
        token: req.body?.token,
      }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    jwt.verify(
      value.token,
      dotenvconfig.JWT_ACCESS,
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

        const decoded_staff = decoded as {
          name: string;
          email: string;
          password: string;
        };

        const staff: THydratedStaffDocument | null =
          await staff_services.findStaffByProp({
            key: "email",
            value: decoded_staff.email,
          });

        if (staff) {
          const is_match_password: boolean =
            await staff_services.isMatchStaffPassword({
              password: decoded_staff.password,
              staff,
            });

          if (!is_match_password) {
            return responses.responseErrorMessage(res, 400, {
              error:
                "Staff already exists! try again using a different email or login",
            });
          }

          const { access_token, refresh_token } =
            await staff_services.createStaffAuthTokens({ staff });

          const { data_except_password } = extractStaffData({
            document: staff,
          });

          return responses.responseSuccessDataAndSaveCookie(
            res,
            refresh_token,
            cookie_config.save_cookie_data,
            200,
            {
              message: "Logged in successfully",
              access_token,
              staff: data_except_password,
            }
          );
        }

        const new_staff: THydratedStaffDocument | null =
          await staff_services.createNewStaff({ data: decoded_staff });

        if (!new_staff) {
          return responses.responseErrorMessage(res, 500, {
            error: "Server error occurred! please try again",
          });
        }

        if (new_staff) {
          const { data_except_password } = extractStaffData({
            document: new_staff,
          });

          const { access_token, refresh_token } =
            await staff_services.createStaffAuthTokens({ staff: new_staff });

          const email_body: IEmailBody =
            email_template.emailToSuperAdminTemplate({
              guest_name: new_staff.name,
              guest_email: new_staff.email,
            });

          if (new_staff.email !== dotenvconfig.SUPER_ADMIN) {
            mailer.sendMailToSuperAdmin(email_body);
          }

          return responses.responseSuccessDataAndSaveCookie(
            res,
            refresh_token,
            cookie_config.save_cookie_data,
            201,
            {
              message: "Registered successfully",
              access_token,
              staff: data_except_password,
            }
          );
        }
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const postLoginStaff: RequestHandler = async (req, res, next) => {
  const { value, error } =
    staff_request_data_validators.login_staff_validate_schema.validate(
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
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({
        key: "email",
        value: value.email,
      });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staff not found!",
      });
    }

    const is_match_password: boolean =
      await staff_services.isMatchStaffPassword({
        password: value.password,
        staff,
      });

    if (!is_match_password) {
      return responses.responseErrorMessage(res, 400, {
        error: "Password does not match!",
      });
    }

    const { access_token, refresh_token } =
      await staff_services.createStaffAuthTokens({ staff });

    const { data_except_password } = extractStaffData({ document: staff });

    return responses.responseSuccessDataAndSaveCookie(
      res,
      refresh_token,
      cookie_config.save_cookie_data,
      200,
      {
        message: "Logged in successfully",
        access_token,
        staff: data_except_password,
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const postLogoutStaff: RequestHandler = async (req, res, next) => {
  const refresh_token: string = req.cookies?.refresh_token;

  if (!refresh_token) {
    return responses.responseErrorMessage(res, 401, {
      error: "Unauthorized!",
    });
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

export const postForgotPassword: RequestHandler = async (req, res, next) => {
  const { value, error } =
    staff_request_data_validators.forgot_password_validate_schema.validate({
      email: req.body?.email,
    });

  if (error) {
    return responses.responseErrorMessage(res, 400, {
      error: error.details[0].message,
    });
  }

  try {
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({
        key: "email",
        value: value.email,
      });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staff not found!",
      });
    }

    const access_token: string = tokens.resetAccountPasswordToken({
      payload: { email: value.email },
      expiresIn: "15m",
    });

    const email_body: IEmailBody =
      email_template.resetAccountPassworEmailTemplate({
        emailTo: value.email,
        receiverName: staff.name,
        access_token,
      });

    const message: string = `E-mail has been sent to ${value.email}. Please follow the instructions to your reset your password.`;
    mailer.sendMail(res, email_body, message);
  } catch (e) {
    return next(e);
  }
};

export const patchResetPassword: RequestHandler = async (req, res, next) => {
  const { value, error } =
    staff_request_data_validators.reset_password_validate_schema.validate(
      {
        token: req.body?.token,
        new_password: req.body?.new_password,
      },
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
    jwt.verify(
      value.token,
      dotenvconfig.JWT_ACCESS,
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

        const decoded_staff = decoded as { email: string };
        const staff: THydratedStaffDocument | null =
          await staff_services.findStaffByProp({
            key: "email",
            value: decoded_staff.email,
          });

        if (!staff) {
          return responses.responseErrorMessage(res, 404, {
            error: "Staff not found!",
          });
        }

        const updated_staff: THydratedStaffDocument | null =
          await staff_services.updateStaffPassword({
            new_password: value.new_password,
            staff,
          });

        if (!updated_staff) {
          return responses.responseErrorMessage(res, 500, {
            error: "Server error occurred! please try again",
          });
        }

        const { access_token, refresh_token } =
          await staff_services.createStaffAuthTokens({ staff: updated_staff });

        const { data_except_password } = extractStaffData({
          document: updated_staff,
        });

        return responses.responseSuccessDataAndSaveCookie(
          res,
          refresh_token,
          cookie_config.save_cookie_data,
          200,
          {
            message: "Updated successfully",
            access_token,
            staff: data_except_password,
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
    staff_request_data_validators.change_password_validate_schema.validate(
      {
        email: req.body?.email,
        password: req.body?.password,
        new_password: req.body?.new_password,
      },
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
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({
        key: "email",
        value: value.email,
      });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staff not found!",
      });
    }

    const is_match_password: boolean =
      await staff_services.isMatchStaffPassword({
        password: value.password,
        staff,
      });

    if (!is_match_password) {
      return responses.responseErrorMessage(res, 400, {
        error: "Password does not match!",
      });
    }

    const updated_staff: THydratedStaffDocument | null =
      await staff_services.updateStaffPassword({
        staff,
        new_password: value.new_password,
      });

    if (!updated_staff) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const { data_except_password } = extractStaffData({
      document: updated_staff,
    });

    return responses.responseSuccessData(res, 200, {
      message: "Passwor changed successfully",
      staff: data_except_password,
    });
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

        const decoded_staff = decoded as IStaffPayload;
        const staff: THydratedStaffDocument | null =
          await staff_services.findStaffByProp({
            key: "_id",
            value: decoded_staff._id,
          });

        if (!staff) {
          return responses.responseErrorMessage(res, 404, {
            error: "User not found!",
          });
        }

        const { access_token } = await staff_services.createStaffAuthTokens({
          staff,
        });

        return responses.responseSuccessData(res, 200, { access_token });
      }
    );
  } catch (e) {
    return next(e);
  }
};

export const getStaffs: RequestHandler = async (req, res, next) => {
  const current_page: number = Number(req.query.page || "1");
  const limit: number = Number(req.query.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const staffs: Array<THydratedStaffDocument> | null =
      await staff_services.findStaffs({ skip, limit });

    if (!staffs) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staffs not found!",
      });
    }

    const total_staffs: number = await staff_services.countStaffs();
    const total_pages: number = Math.ceil(total_staffs / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      staffs,
    });
  } catch (e) {
    return next(e);
  }
};

export const getStaffById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.staffId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid staff id! please try again using a valid one",
    });
  }

  try {
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({ key: "_id", value: _id });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staff not found!",
      });
    }

    const { data_except_password } = extractStaffData({ document: staff });

    return responses.responseSuccessData(res, 200, {
      staff: data_except_password,
    });
  } catch (e) {
    return next(e);
  }
};

export const patchStaffProfileImageById: RequestHandler = async (
  req,
  res,
  next
) => {
  const _id: string = req.params?.staffId;
  const image: UploadedFile = req.files?.image as UploadedFile;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid staff id! please try again using a valid one",
    });
  }

  try {
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({ key: "_id", value: _id });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staff not found!",
      });
    }

    const image_error_response: responses.TImageErrorResponse | undefined =
      await responses.responseImageErrorMessage(res, image);

    if (image_error_response) return image_error_response;

    if (staff.image.isChangedSelf) {
      await amazon_s3.removeImageFromS3({ image_key: staff.image.key });
    }

    const cloud_image: amazon_s3_type.TS3ManagedUpload | undefined =
      await amazon_s3.uploadImageToS3({ image });

    if (!cloud_image) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    const updated_staff: THydratedStaffDocument | null =
      await staff_services.updateStaffImageById({
        _id,
        image: {
          isChangedSelf: true,
          key: cloud_image.Key,
          url: amazon_s3.cloudfrontImageUrl({ cloud_image }),
        },
      });

    if (!updated_staff) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const { data_except_password } = extractStaffData({
      document: updated_staff,
    });

    return responses.responseSuccessData(res, 200, {
      message: "Image updated successfully",
      staff: data_except_password,
    });
  } catch (e) {
    return next(e);
  }
};

export const patchStaffRoleById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.staffId;
  const { value, error } =
    staff_request_data_validators.update_staff_role_validate_schema.validate({
      role: req.body?.role,
    });

  if (error) {
    return responses.responseErrorMessage(res, 400, {
      error: error.details[0].message,
    });
  }

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid staff id! please try again using a valid one",
    });
  }

  try {
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({ key: "_id", value: _id });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staff not found!",
      });
    }

    const updated_staff: THydratedStaffDocument | null =
      await staff_services.updateStaffRoleById({
        _id,
        data: { role: value.role },
      });

    if (!updated_staff) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const { data_except_password } = extractStaffData({
      document: updated_staff,
    });

    return responses.responseSuccessData(res, 200, {
      message: "Role updated successfully",
      staff: data_except_password,
    });
  } catch (e) {
    return next(e);
  }
};

export const putStaffById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.staffId;
  const { value, error } =
    staff_request_data_validators.update_staff_validate_schema.validate(
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
      error: "Invalid staff id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({ key: "_id", value: _id });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const updated_staff: THydratedStaffDocument | null =
      await staff_services.updateStaffById({ _id, data: value });

    if (!updated_staff) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const { access_token, refresh_token } =
      await staff_services.createStaffAuthTokens({ staff: updated_staff });
    const { data_except_password } = extractStaffData({
      document: updated_staff,
    });

    return res
      .cookie(cookie_config.save_cookie_data.cookie_token, refresh_token, {
        ...cookie_config.save_cookie_data.cookie_options,
        sameSite: "none",
      })
      .status(200)
      .json({
        message: "Updated successfully",
        access_token,
        staff: data_except_password,
      });
  } catch (e) {
    return next(e);
  }
};

export const deleteStaffById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.staffId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid staff id! please try again using a valid one",
    });
  }

  try {
    const staff: THydratedStaffDocument | null =
      await staff_services.findStaffByProp({ key: "_id", value: _id });

    if (!staff) {
      return responses.responseErrorMessage(res, 404, {
        error: "Staff not found!",
      });
    }

    if (staff.image.isChangedSelf) {
      await amazon_s3.removeImageFromS3({ image_key: staff.image.key });
    }

    await staff_services.removeStaffById({ _id });

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
