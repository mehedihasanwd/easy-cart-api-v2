import { User } from "../models/User";
import dotenvconfig from "../config/dotenvconfig";
import { IUserPayload } from "../types/user_and_staff/payload_type";
import {
  THydratedUserDocument,
  TRemovedUserDocuement,
} from "../types/user/user_document_type";
import * as user_services_type from "../types/user/user_controllers_services_type";
import * as common_type from "../types/common_type";

export const findUserByProp = async ({
  key,
  value,
}: user_services_type.IFindUserByPropServiceParam): Promise<THydratedUserDocument | null> => {
  if (key === "_id") {
    return await User.findById(value);
  }
  return await User.findOne({ [key]: value });
};

export const createNewUser = async ({
  data,
}: user_services_type.ICreateNewUserServiceParam): Promise<THydratedUserDocument | null> => {
  const new_user: THydratedUserDocument | null = new User({ ...data });

  if (!new_user) return null;

  return new_user.save();
};

export const findUsers = async ({
  skip,
  limit,
}: user_services_type.IFindUsersServiceParam): Promise<Array<THydratedUserDocument> | null> => {
  const users: Array<THydratedUserDocument> | null =
    skip && limit
      ? await User.aggregate([
          {
            $skip: skip,
          },

          { $limit: limit },

          { $project: { password: 0 } },

          {
            $sort: { _id: 1 },
          },
        ])
      : await User.aggregate([
          { $project: { password: 0 } },
          { $sort: { _id: -1 } },
        ]);

  if (!users || users.length === 0) return null;

  return users;
};

export const countUsers = async (): Promise<number> => {
  return await User.countDocuments();
};

export const updateUserById = async ({
  _id,
  data,
}: user_services_type.IUpdateUserByIdServiceParam): Promise<THydratedUserDocument | null> => {
  const updated_user: THydratedUserDocument | null =
    await User.findByIdAndUpdate(
      _id,
      {
        $set: { ...data },
      },
      { new: true }
    );

  if (!updated_user) return null;

  return updated_user.save();
};

export const updateUserImageById = async ({
  _id,
  image,
}: user_services_type.IUpdateUserImageServiceParam): Promise<THydratedUserDocument | null> => {
  const updated_user: THydratedUserDocument | null =
    await User.findByIdAndUpdate(
      _id,
      {
        $set: { image: { ...image } },
      },
      { new: true }
    );

  if (!updated_user) return null;

  return updated_user.save();
};

export const removeUserById = async ({
  _id,
}: {
  _id: string;
}): Promise<TRemovedUserDocuement> => {
  return await User.findByIdAndDelete(_id);
};

export const createUserAuthTokens = async ({
  user,
}: user_services_type.ICreateUserAuthTokensServiceParam): Promise<common_type.ICreateAuthTokens> => {
  const payload: IUserPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const access_token: string = await user.createAuthToken({
    payload,
    secretKey: dotenvconfig.JWT_ACCESS,
    expiresIn: "3h",
  });

  const refresh_token: string = await user.createAuthToken({
    payload,
    secretKey: dotenvconfig.JWT_REFRESH,
    expiresIn: "7d",
  });

  return { access_token, refresh_token };
};

export const isMatchUserPassword = async ({
  password,
  user,
}: user_services_type.IMatchUserPasswordServiceParam): Promise<boolean> => {
  return await user.validatePassword({ password });
};

export const updateUserPassword = async ({
  new_password,
  user,
}: user_services_type.IUpdateUserPasswordServiceParam): Promise<THydratedUserDocument | null> => {
  user.password = new_password;
  return user.save();
};
