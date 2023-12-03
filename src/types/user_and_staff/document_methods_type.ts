import { IUserPayload, IStaffPayload } from "./payload_type";

interface ICreateUserAuthTokenParams {
  payload: IUserPayload;
  secretKey: string;
  expiresIn: string;
}

interface ICreateStaffAuthTokenParams {
  payload: IStaffPayload;
  secretKey: string;
  expiresIn: string;
}

export interface IValidatePassword {
  validatePassword({ password }: { password: string }): Promise<boolean>;
}

export interface IUserMethods extends IValidatePassword {
  createAuthToken({
    payload,
    secretKey,
    expiresIn,
  }: ICreateUserAuthTokenParams): Promise<string>;
}

export interface IStaffMethods extends IValidatePassword {
  createAuthToken({
    payload,
    secretKey,
    expiresIn,
  }: ICreateStaffAuthTokenParams): Promise<string>;
}
