import * as common_type from "../common_type";

export interface IPayload
  extends common_type.IDocumentId,
    common_type.IName,
    common_type.IEmail {}

export interface IUserPayload extends IPayload, common_type.IUserRole {}

export interface IStaffPayload extends IPayload, common_type.IStaffRole {}

export interface IAuthPayload extends IPayload {
  role: common_type.TAllRole;
}
