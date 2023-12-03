import { Staff } from "../models/Staff";
import dotenvconfig from "../config/dotenvconfig";
import { IStaffPayload } from "../types/user_and_staff/payload_type";
import {
  THydratedStaffDocument,
  TRemovedStaffDocument,
} from "../types/staff/staff_document_type";
import * as staff_services_type from "../types/staff/staff_controllers_services_type";
import * as common_type from "../types/common_type";

export const findStaffByProp = async ({
  key,
  value,
}: staff_services_type.IFindStaffByPropServiceParam): Promise<THydratedStaffDocument | null> => {
  if (key === "_id") {
    return await Staff.findById(value);
  }

  return await Staff.findOne({ [key]: value });
};

export const createNewStaff = async ({
  data,
}: staff_services_type.ICreateNewStaffServiceParam): Promise<THydratedStaffDocument | null> => {
  const new_staff: THydratedStaffDocument | null = new Staff({ ...data });

  if (!new_staff) return null;

  return new_staff.save();
};

export const findStaffs = async ({
  skip,
  limit,
}: common_type.ISkipLimitOptional): Promise<Array<THydratedStaffDocument> | null> => {
  const staffs: Array<THydratedStaffDocument> | null =
    skip && limit
      ? await Staff.aggregate([
          {
            $skip: skip,
          },

          { $limit: limit },

          { $project: { password: 0 } },

          {
            $sort: { _id: -1 },
          },
        ])
      : await Staff.aggregate([
          { $project: { password: 0 } },
          { $sort: { _id: -1 } },
        ]);

  if (!staffs || staffs.length === 0) return null;

  return staffs;
};

export const countStaffs = async (): Promise<number> => {
  return await Staff.countDocuments();
};

export const updateStaffById = async ({
  _id,
  data,
}: staff_services_type.IUpdateStaffByIdServiceParam): Promise<THydratedStaffDocument | null> => {
  const staff: THydratedStaffDocument | null = await Staff.findByIdAndUpdate(
    _id,
    {
      $set: { ...data },
    },
    { new: true }
  );

  if (!staff) return null;

  return staff.save();
};

export const updateStaffRoleById = async ({
  _id,
  data,
}: staff_services_type.IUpdateStaffRoleByIdServiceParam): Promise<THydratedStaffDocument | null> => {
  const updated_staff: THydratedStaffDocument | null =
    await Staff.findByIdAndUpdate(
      _id,
      {
        $set: { ...data },
      },
      { new: true }
    );

  if (!updated_staff) return null;

  return updated_staff.save();
};

export const updateStaffImageById = async ({
  _id,
  image,
}: staff_services_type.IUpdateStaffImageByIdServiceParam): Promise<THydratedStaffDocument | null> => {
  const staff: THydratedStaffDocument | null = await Staff.findByIdAndUpdate(
    _id,
    {
      $set: { image: { ...image } },
    },
    { new: true }
  );

  if (!staff) return null;

  return staff.save();
};

export const removeStaffById = async ({
  _id,
}: common_type.IDocumentId): Promise<TRemovedStaffDocument> => {
  return await Staff.findByIdAndDelete(_id);
};

export const createStaffAuthTokens = async ({
  staff,
}: staff_services_type.ICreateStaffAuthTokensServiceParam): Promise<common_type.ICreateAuthTokens> => {
  const payload: IStaffPayload = {
    _id: staff._id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  };

  const access_token: string = await staff.createAuthToken({
    payload,
    secretKey: dotenvconfig.JWT_ACCESS,
    expiresIn: "3h",
  });

  const refresh_token: string = await staff.createAuthToken({
    payload,
    secretKey: dotenvconfig.JWT_REFRESH,
    expiresIn: "7d",
  });

  return { access_token, refresh_token };
};

export const isMatchStaffPassword = async ({
  password,
  staff,
}: staff_services_type.IMatchStaffPasswordServiceParam): Promise<boolean> => {
  return await staff.validatePassword({ password });
};

export const updateStaffPassword = async ({
  new_password,
  staff,
}: staff_services_type.IUpdateStaffPasswordServiceParam): Promise<THydratedStaffDocument | null> => {
  staff.password = new_password;
  return staff.save();
};
