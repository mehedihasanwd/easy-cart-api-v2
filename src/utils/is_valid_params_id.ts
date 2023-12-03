import { isValidObjectId } from "mongoose";

export const isValidParamsId = ({ _id }: { _id: string }): boolean => {
  return isValidObjectId(_id);
};
