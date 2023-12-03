import { uid } from "uid";

export const createUniqueId = (length: number = 24): string => {
  return uid(length);
};
