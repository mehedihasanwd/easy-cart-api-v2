import mongoose from "mongoose";

export type TSize = "S" | "L" | "M" | "XL";
export type TGender = "man" | "woman" | "custom";
export type TStaffRole = "admin" | "editor" | "guest";
export type TUserRole = "user";
export type TAllRole = TStaffRole & TUserRole;
export type TCategory = "men" | "woman" | "boy" | "girl" | "sports";
export type TStatus = "active" | "inactive";
export type TTopCategory =
  | "Featured"
  | "Bestseller"
  | "Highest rated"
  | "Regular";

export interface IDocumentId {
  _id: string | mongoose.Types.ObjectId;
}

export interface IOrderProductId {
  product_id: string;
}

export interface IName {
  name: string;
}

export interface IEmail {
  email: string;
}

export interface IPassword {
  password: string;
}

export interface INewPassword {
  new_password: string;
}

export interface IGender {
  gender: TGender;
}

export interface IPhone {
  phone: string;
}

export interface IImageProps {
  key: string;
  url: string;
}

export interface IImage {
  image: IImageProps;
}

export interface IProfileImage {
  image: {
    isChangedSelf: boolean;
    key: string;
    url: string;
  };
}

export interface IStaffRole {
  role: TStaffRole;
}

export interface IUserRole {
  role: TUserRole;
}

export interface ICountry {
  country: string;
}

export interface ICity {
  city: string;
}

export interface IHouseNumberOrName {
  house_number_or_name: string;
}

export interface IPostCode {
  post_code: number;
}

export interface ICategoryName {
  name: TCategory;
}

export interface ICategory {
  category: TCategory;
}

export interface IDescription {
  description: string;
}

export interface IUrl {
  url: string;
}

export interface ISlug {
  slug: string;
}

export interface IStatus {
  status: TStatus;
}

export interface ISlug {
  slug: string;
}

export interface IOriginalPrice {
  original_price: number;
}

export interface IPrice {
  price: number;
}

export interface IProductType {
  product_type: string;
}

export interface IToken {
  token: string;
}

export interface ISkipLimitOptional {
  skip?: number;
  limit?: number;
}

export interface IAccessToken {
  access_token: string;
}

export interface IRefreshToken {
  refresh_token: string;
}

export interface ICreateAuthTokens extends IAccessToken, IRefreshToken {}

export interface IRegister extends IName, IEmail, IPassword {}

export interface ILogin extends IEmail, IPassword {}

export interface IForgotPassword extends IEmail {}

export interface IResetPassword extends INewPassword, IToken {}

export interface IChangePassword extends ILogin, INewPassword {}

export interface IUploadImageServiceData {
  data: IProfileImage;
}

export interface IQuantity {
  quantity: number;
}

export interface IColor {
  color: string;
}

export interface ISize {
  size: TSize;
}

export interface IBrand {
  brand: string;
}

export interface IValue {
  value: string | mongoose.Types.ObjectId;
}
