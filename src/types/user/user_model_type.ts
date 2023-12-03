import mongoose from "mongoose";
import { IUserMethods } from "../user_and_staff/document_methods_type";
import * as common_type from "../common_type";

export interface IUserSchema
  extends common_type.IName,
    common_type.IEmail,
    common_type.IPassword,
    common_type.IGender,
    common_type.IUserRole,
    common_type.IPhone,
    common_type.IProfileImage,
    common_type.ICountry,
    common_type.ICity,
    common_type.IHouseNumberOrName,
    common_type.IPostCode {}

export interface IUserModel
  extends mongoose.Model<IUserSchema, {}, IUserMethods> {}
