import joi from "joi";
import {
  IOrderStatus,
  IPostNewOrder,
} from "./../types/order/order_controllers_services_type";
import * as common_validator_schema_props from "./common_validator_schema_props";

// helpers
const user_id_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "User id should be a string!",
    "string.empty": "User id is required!",
  });

const product_id_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Product id should be a string!",
    "string.empty": "Product id is required!",
  });

const name_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Product name should be a string!",
    "string.empty": "Product name is required!",
  });

const slug_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Slug should be a string!",
    "string.empty": "Slug is required!",
  });

const description_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Description should be a string!",
    "string.empty": "Description is required!",
  });

const price_schema: joi.NumberSchema<number> =
  common_validator_schema_props.number_schema.required().messages({
    "number.base": "Price should be a number!",
    "number.empty": "Price is required!",
  });

const quantity_schema: joi.NumberSchema<number> =
  common_validator_schema_props.number_schema.required().min(1).messages({
    "number.base": "Quantity should be a number!",
    "number.empty": "Quantity is required!",
    "number.min": "Quantity should be at least 1",
  });

const color_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Color should be a string!",
    "string.empty": "Color is required!",
  });

const size_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema
    .required()
    .valid("S", "M", "L", "XL")
    .messages({
      "string.base": "Size should be a string!",
      "string.empty": "Size is required!",
      "any.only": "Size should be either 'S', 'M', 'L', or 'XL'",
    });

const brand_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Brand should be a string!",
    "string.empty": "Brand is required!",
  });

const category_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Category should be a string!",
    "string.empty": "Category is required!",
    "any.only":
      "Category should be either 'men', 'women', 'boy, 'girl' or 'sports'",
  });

const product_type_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Product type should be a string!",
    "string.empty": "Product type is required!",
  });

const gender_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema
    .required()
    .valid("man", "woman", "unisex")
    .messages({
      "string.base": "Gender should be a string!",
      "string.empty": "Gender is required!",
      "any.only": "Gender should be either 'man', 'woman' or 'unisex'",
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

const image_schema: joi.ObjectSchema<{ key: string; url: string }> = joi
  .object({
    key: key_schema,
    url: url_schema,
  })
  .required();

const update_status_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema
    .required()
    .valid("pending", "processing", "shipped", "completed")
    .messages({
      "string.base": "Status should be a string!",
      "string.empty": "Status is required!",
      "any.only":
        "Status should be either 'pending', 'processing', 'shipped' or 'completed'",
    });

const country_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Country should be a string!",
    "string.empty": "Country is required!",
  });

const city_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "City should be a string!",
    "string.empty": "City is required!",
  });

const house_number_or_name_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "House number or name should be a string!",
    "string.empty": "House number or name is required!",
  });

const phone_schema: joi.StringSchema<string> =
  common_validator_schema_props.string_schema.required().messages({
    "string.base": "Phone should be a string!",
    "string.empty": "Phone is required!",
  });

const post_code_schema: joi.NumberSchema<number> =
  common_validator_schema_props.number_schema.required().messages({
    "number.base": "Postal code should be a number!",
    "number.empty": "Postal code is required!",
  });

// validators
export const post_new_order_validate_schema: joi.ObjectSchema<IPostNewOrder> =
  joi
    .object({
      user_id: user_id_schema,
      shipping_address: joi
        .object({
          country: country_schema,
          city: city_schema,
          house_number_or_name: house_number_or_name_schema,
          phone: phone_schema,
          post_code: post_code_schema,
        })
        .required(),
      products: joi
        .array()
        .items(
          joi
            .object({
              product_id: product_id_schema,
              name: name_schema,
              slug: slug_schema,
              description: description_schema,
              price: price_schema,
              quantity: quantity_schema,
              color: color_schema,
              size: size_schema,
              brand: brand_schema,
              category: category_schema,
              product_type: product_type_schema,
              gender: gender_schema,
              image: image_schema,
            })
            .required()
        )
        .required(),
    })
    .required();

export const patch_order_status_validate_schema: joi.ObjectSchema<IOrderStatus> =
  joi.object({
    status: update_status_schema,
  });
