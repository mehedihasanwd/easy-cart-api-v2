import mongoose from "mongoose";
import * as common_type from "../common_type";
import { IUserDocument } from "./user_document_type";

// controllers type
export interface IRegisterUser extends common_type.IRegister {}

export interface IUpdateUser
  extends common_type.IName,
    common_type.IGender,
    common_type.IPhone,
    common_type.ICountry,
    common_type.ICity,
    common_type.IHouseNumberOrName,
    common_type.IPostCode {}

export interface ILoginUser extends common_type.ILogin {}

export interface IForgotUserPassword extends common_type.IForgotPassword {}

export interface IResetUserPassword extends common_type.IResetPassword {}

export interface IChangeUserPassword extends common_type.IChangePassword {}

// services type
interface IUserDocumentProp {
  user: IUserDocument;
}

export interface IFindUserByPropServiceParam {
  key: "_id" | "email";
  value: string | mongoose.Types.ObjectId;
}

export interface IFindUsersServiceParam
  extends common_type.ISkipLimitOptional {}

export interface ICreateNewUserServiceParam {
  data: IRegisterUser;
}

export interface IUpdateUserByIdServiceParam {
  _id: string | mongoose.Types.ObjectId;
  data: IUpdateUser;
}

export interface IMatchUserPasswordServiceParam
  extends common_type.IPassword,
    IUserDocumentProp {}

export interface IUpdateUserPasswordServiceParam
  extends common_type.INewPassword,
    IUserDocumentProp {}

export interface IUpdateUserImageServiceParam
  extends common_type.IDocumentId,
    common_type.IProfileImage {}

export interface ICreateUserAuthTokensServiceParam extends IUserDocumentProp {}
