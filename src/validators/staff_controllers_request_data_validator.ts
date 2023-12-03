import joi from "joi";
import {
  IRegisterStaff,
  IUpdateStaff,
  IUpdateStaffRole,
} from "../types/staff/staff_controllers_services_type";
import * as common_validator_schema_props from "./common_validator_schema_props";

// helpers
const update_role_schema: joi.StringSchema<string> = joi
  .string()
  .required()
  .trim()
  .valid("admin", "editor", "guest")
  .messages({
    "string.base": "Role should be string!",
    "any.only": "Role should be either 'admin', 'editor', or 'guest'",
    "string.empty": "Role is required!",
  });

// staff validators
export const verify_email_validate_schema: joi.ObjectSchema<IRegisterStaff> =
  joi
    .object({
      name: common_validator_schema_props.name_schema,
      email: common_validator_schema_props.email_schema,
      password: common_validator_schema_props.password_schema,
    })
    .required();

export const register_staff_token_validate_schema: joi.ObjectSchema<{
  token: string;
}> = joi
  .object({
    token: common_validator_schema_props.register_token_schema,
  })
  .required();

export const login_staff_validate_schema: joi.ObjectSchema<{
  email: string;
  password: string;
}> = joi
  .object({
    email: common_validator_schema_props.email_schema,
    password: common_validator_schema_props.password_schema,
  })
  .required();

export const forgot_password_validate_schema: joi.ObjectSchema<{
  email: string;
}> = joi
  .object({
    email: common_validator_schema_props.email_schema,
  })
  .required();

export const reset_password_validate_schema: joi.ObjectSchema<{
  token: string;
  new_password: string;
}> = joi
  .object({
    token: common_validator_schema_props.register_token_schema,
    new_password: common_validator_schema_props.password_schema,
  })
  .required();

export const change_password_validate_schema: joi.ObjectSchema<{
  email: string;
  password: string;
  new_password: string;
}> = joi
  .object({
    email: common_validator_schema_props.email_schema,
    password: common_validator_schema_props.password_schema,
    new_password: common_validator_schema_props.password_schema,
  })
  .required();

export const update_staff_validate_schema: joi.ObjectSchema<IUpdateStaff> = joi
  .object({
    name: common_validator_schema_props.name_schema,
    gender: common_validator_schema_props.gender_schema,
    phone: common_validator_schema_props.phone_schema,
    country: common_validator_schema_props.country_schema,
    city: common_validator_schema_props.city_schema,
    house_number_or_name:
      common_validator_schema_props.house_number_or_name_schema,
    post_code: common_validator_schema_props.post_code_schema,
  })
  .required();

export const update_staff_role_validate_schema: joi.ObjectSchema<IUpdateStaffRole> =
  joi
    .object({
      role: update_role_schema,
    })
    .required();
