import joi from "joi";
import {
  IPostNewReview,
  IUpdateReviewById,
} from "../types/review/review_controllers_services_type";
import * as common_type from "../types/common_type";
import * as common_validator_schema_props from "./common_validator_schema_props";

// helpers
const order_id_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Order id should be string!",
    "string.empty": "Order id is required!",
  });

const user_id_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "User id should be string!",
    "string.empty": "User id is required!",
  });

const key_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Key should be a string!",
    "string.empty": "Key is required!",
  });

const url_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Url should be a string!",
    "string.empty": "Url is required!",
  });

const user_image_schema: joi.ObjectSchema<common_type.IImage> = joi
  .object({
    key: key_schema,
    url: url_schema,
  })
  .required();

const product_id_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Product id should be a string!",
    "string.empty": "Product id is required!",
  });

const product_uid_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Product unique id should be a string!",
    "string.empty": "Product unique id is required!",
  });

const review_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Review should be a string!",
    "string.empty": "Review is required!",
  });

const rating_schema: joi.NumberSchema<number> =
  common_validator_schema_props.number_schema.required().max(5).messages({
    "number.base": "Rating should be a valid number",
    "number.max": "Rating should not be greater than 5!",
    "number.empty": "Rating is required!",
  });

// validators
export const post_new_review_validate_schema: joi.ObjectSchema<IPostNewReview> =
  joi
    .object({
      user_name: common_validator_schema_props.name_schema,
      user_image: user_image_schema,
      user_id: user_id_schema,
      product_id: product_id_schema,
      order_id: order_id_schema,
      product_uid: product_uid_schema,
      review: review_schema,
      rating: rating_schema,
    })
    .required();

export const put_review_by_id_validate_schema: joi.ObjectSchema<IUpdateReviewById> =
  joi
    .object({
      user_id: user_id_schema,
      product_id: product_id_schema,
      product_uid: product_uid_schema,
      review: review_schema,
      rating: rating_schema,
    })
    .required();
