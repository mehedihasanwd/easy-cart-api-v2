import joi from "joi";

export const string_schema: joi.StringSchema<string> = joi.string().trim();
export const number_schema: joi.NumberSchema<number> = joi.number();

export const name_schema: joi.StringSchema<string> = string_schema
  .required()
  .trim()
  .min(5)
  .max(30)
  .messages({
    "string.base": "Name should be a string!",
    "string.min": "Name should not be less than 5 characters!",
    "string.max": "Name should not exceed 30 characters!",
    "string.empty": "Name is required!",
  });

export const email_schema: joi.StringSchema<string> = string_schema
  .required()
  .trim()
  .email({
    minDomainSegments: 2,
    tlds: {
      allow: ["com", "net", "info"],
    },
  })
  .normalize()
  .messages({
    "string.base": "E-mail should be a string!",
    "string.empty": "E-mail is required!",
  });

export const password_schema: joi.StringSchema<string> = string_schema
  .required()
  .trim()
  .min(8)
  .max(30)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
  .messages({
    "string.base": "Password should be string!",
    "string.pattern.base":
      "Password must be 8 characters long at least, contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character",
    "string.empty": "Password is required!",
  });

export const gender_schema: joi.StringSchema<string> = string_schema
  .trim()
  .valid("man", "woman", "custom")
  .messages({
    "string.base": "Gender should be a string!",
    "any.only": "Gender should be either 'men', 'woman' or 'custom'",
    "string.empty": "Gender is required!",
  });

export const phone_schema: joi.StringSchema<string> = joi
  .string()
  .trim()
  .max(15)
  .messages({
    "string.base": "Phone should be a string!",
  });

export const country_schema: joi.StringSchema<string> = joi
  .string()
  .trim()
  .messages({
    "string.base": "Country should be a string!",
  });

export const city_schema: joi.StringSchema<string> = joi
  .string()
  .trim()
  .messages({
    "string.base": "City should be a string!",
  });

export const house_number_or_name_schema: joi.StringSchema<string> =
  string_schema.trim().messages({
    "string.base": "House number or name should be a string!",
  });

export const post_code_schema: joi.NumberSchema<number> =
  number_schema.messages({
    "number.base": "Postal code should be a number!",
  });

export const register_token_schema: joi.StringSchema<string> = string_schema
  .required()
  .trim()
  .messages({
    "string.base": "Token should be a string!",
    "string.empty": "Token is required!",
  })
  .required();
