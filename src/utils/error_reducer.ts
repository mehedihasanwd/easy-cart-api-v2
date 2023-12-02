import joi from "joi";

export const errorReducer = (details: joi.ValidationErrorItem[]): object => {
  return details.reduce((acc: any, cur) => {
    acc[cur.path[0]] = cur.message;
    return acc;
  }, {});
};
