import mongoose from "mongoose";
import { IStaffDocument } from "./staff_document_type";
import * as common_type from "../common_type";

// controllers type
export interface IRegisterStaff extends common_type.IRegister {}

export interface ILoginStaff extends common_type.ILogin {}

export interface IUpdateStaff
  extends common_type.IName,
    common_type.IGender,
    common_type.IPhone,
    common_type.ICountry,
    common_type.ICity,
    common_type.IHouseNumberOrName,
    common_type.IPostCode {}

export interface IUpdateStaffRole extends common_type.IStaffRole {}

export interface IForgotStaffPassword extends common_type.IForgotPassword {}

export interface IResetStaffPassword extends common_type.IResetPassword {}

export interface IChangeStaffPassword extends common_type.IChangePassword {}

// services type
interface IStaffProp {
  staff: IStaffDocument;
}

export interface IFindStaffByPropServiceParam {
  key: "_id" | "email";
  value: string | mongoose.Types.ObjectId;
}

export interface IFindStaffsServiceParam
  extends common_type.ISkipLimitOptional {}

export interface ICreateNewStaffServiceParam {
  data: IRegisterStaff;
}

export interface IUpdateStaffByIdServiceParam extends common_type.IDocumentId {
  data: IUpdateStaff;
}

export interface IUpdateStaffRoleByIdServiceParam
  extends common_type.IDocumentId {
  data: IUpdateStaffRole;
}

export interface IMatchStaffPasswordServiceParam
  extends common_type.IPassword,
    IStaffProp {}

export interface IUpdateStaffPasswordServiceParam
  extends common_type.INewPassword,
    IStaffProp {}

export interface IUpdateStaffImageByIdServiceParam
  extends common_type.IDocumentId,
    common_type.IImage {}

export interface ICreateStaffAuthTokensServiceParam extends IStaffProp {}
