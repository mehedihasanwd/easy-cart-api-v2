import joi from "joi";
import {
  ICategoryStatus,
  IPostNewCategory,
} from "../types/category/category_controllers_services_type";
import * as common_schema_props from "./common_validator_schema_props";

// helpers
const name_schema: joi.StringSchema<string> = common_schema_props.string_schema
  .required()
  .valid("men", "women", "boy", "girl", "sports")
  .lowercase()
  .messages({
    "string.base": "Name should be a string!",
    "any.only":
      "Email should be either 'men', 'women', 'boy', 'girl' or 'sports'",
    "string.empty": "Name is required!",
  });

const description_schema: joi.StringSchema<string> =
  common_schema_props.string_schema.required().messages({
    "string.base": "Description should be string!",
    "string.empty": "Description is required!",
  });

const status_schema: joi.StringSchema<string> =
  common_schema_props.string_schema
    .required()
    .valid("active", "inactive")
    .messages({
      "string.base": "Status should be string!",
      "any.only": "Status should be either 'active' or inacitve",
      "string.empty": "Status is required!",
    });

// validators
export const post_new_category_validate_schmea: joi.ObjectSchema<IPostNewCategory> =
  joi
    .object({
      name: name_schema,
      description: description_schema,
    })
    .required();

export const patch_category_status_validate_schema: joi.ObjectSchema<ICategoryStatus> =
  joi
    .object({
      status: status_schema,
    })
    .required();
