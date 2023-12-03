import jwt from "jsonwebtoken";
import dotenvconfig from "../config/dotenvconfig";
import { IRegister } from "../types/common_type";

export const accountRegistrationToken = ({
  payload,
  expiresIn,
}: {
  payload: IRegister;
  expiresIn: string;
}): string => {
  return jwt.sign(payload, dotenvconfig.JWT_ACCESS, { expiresIn });
};

export const resetAccountPasswordToken = ({
  payload,
  expiresIn,
}: {
  payload: { email: string };
  expiresIn: string;
}): string => {
  return jwt.sign(payload, dotenvconfig.JWT_ACCESS, { expiresIn });
};
