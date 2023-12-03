import joi from "joi";
import {
  IRegisterUser,
  IUpdateUser,
} from "../types/user/user_controllers_services_type";
import * as common_validator_schema_props from "./common_validator_schema_props";

// user validators
export const verify_email_validate_schema: joi.ObjectSchema<IRegisterUser> =
  joi.object({
    name: common_validator_schema_props.name_schema,
    email: common_validator_schema_props.email_schema,
    password: common_validator_schema_props.password_schema,
  });

export const register_user_validate_schema: joi.ObjectSchema<{
  token: string;
}> = joi.object({
  token: common_validator_schema_props.register_token_schema,
});

export const login_user_schema: joi.ObjectSchema<{
  email: string;
  password: string;
}> = joi.object({
  email: common_validator_schema_props.email_schema,
  password: common_validator_schema_props.password_schema,
});

export const forgot_password_schema: joi.ObjectSchema<{
  email: string;
}> = joi.object({
  email: common_validator_schema_props.email_schema,
});

export const reset_password_schema: joi.ObjectSchema<{
  token: string;
  new_password: string;
}> = joi.object({
  token: common_validator_schema_props.register_token_schema,
  new_password: common_validator_schema_props.password_schema,
});

export const change_password_schema: joi.ObjectSchema<{
  email: string;
  password: string;
  new_password: string;
}> = joi.object({
  email: common_validator_schema_props.email_schema,
  password: common_validator_schema_props.password_schema,
  new_password: common_validator_schema_props.password_schema,
});

export const update_user_validator_schema: joi.ObjectSchema<IUpdateUser> =
  joi.object({
    name: common_validator_schema_props.name_schema,
    gender: common_validator_schema_props.gender_schema,
    phone: common_validator_schema_props.phone_schema,
    country: common_validator_schema_props.country_schema,
    city: common_validator_schema_props.city_schema,
    house_number_or_name:
      common_validator_schema_props.house_number_or_name_schema,
    post_code: common_validator_schema_props.post_code_schema,
  });
