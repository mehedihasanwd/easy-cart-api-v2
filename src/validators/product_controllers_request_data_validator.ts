import joi from "joi";
import * as product_controller_type from "../types/product/product_controllers_services_type";
import * as common_schema_props from "./common_validator_schema_props";
import * as common_type from "../types/common_type";

const name_schema: joi.StringSchema<string> = common_schema_props.string_schema
  .required()
  .messages({
    "string.base": "Name should be a string!",
    "string.empty": "Name is required!",
  });

const description_schema: joi.StringSchema<string> =
  common_schema_props.string_schema.required().messages({
    "string.base": "Description should be a string!",
    "string.empty": "Description is required!",
  });

const brand_schema: joi.StringSchema<string> = common_schema_props.string_schema
  .required()
  .messages({
    "string.base": "Brand should be a string!",
    "string.empty": "Brand is required!",
  });

const product_type_schema: joi.StringSchema<string> =
  common_schema_props.string_schema.required().messages({
    "string.base": "Product type is required!",
    "string.empty": "Product type is required!",
  });

const gender_schema: joi.StringSchema<string> =
  common_schema_props.string_schema
    .required()
    .valid("man", "woman", "unisex")
    .messages({
      "string.base": "Gender should be a string",
      "string.empty": "Gender is required!",
      "any.only": "Gender should be either 'man', 'woman' or 'unisex'",
    });

const original_price_schema: joi.NumberSchema<number> =
  common_schema_props.number_schema.required().min(19).messages({
    "number.base": "Original price should be a number!",
    "number.min": "Original price minumum value should be 19",
    "number.empty": "Original price is required!",
  });

const in_stock_schema: joi.NumberSchema<number> =
  common_schema_props.number_schema.required().min(1).messages({
    "number.base": "Stock should be a number!",
    "number.min": "Stock amount should be at least 1",
    "number.empty": "Stock is required!",
  });

const stock_string_schema: joi.StringSchema<string> =
  common_schema_props.string_schema
    .required()
    .valid("in_stock", "stockout")
    .messages({
      "string.base": "Stock should be a string!",
      "any.only": "Stock should be either 'in_stock' or 'stockout'",
      "string.empty": "Stock is required!",
    });

const colors_schema: joi.ArraySchema<string[]> = joi
  .array()
  .items(common_schema_props.string_schema.required())
  .required()
  .messages({
    "array.base": "Colors should be an array of strings!",
    "array.empty": "Colors is required!",
  });

const sizes_schema: joi.ArraySchema<common_type.TSize[]> = joi
  .array()
  .items(
    common_schema_props.string_schema.required().valid("S", "M", "L", "XL")
  )
  .required()
  .messages({
    "array.base": "Sizes should be an array of strings!",
    "array.empty": "Sizes is required!",
    "any.only": "Each size should be 'S', 'M', 'L', or 'XL'",
  });

const category_schema: joi.StringSchema<string> =
  common_schema_props.string_schema
    .required()
    .valid("men", "women", "boy", "girl", "sports")
    .messages({
      "string.base": "Category should be string!",
      "string.empty": "Category is required!",
      "any.only":
        "Category should be either 'men', 'women', 'boy', 'girl' or 'sports'",
    });

const status_schema: joi.StringSchema<string> =
  common_schema_props.string_schema.valid("active", "inactive").messages({
    "string.base": "Status should be string!",
    "any.only": "Status should be either 'active' or 'inactive'",
  });

const discount_schema: joi.NumberSchema<number> =
  common_schema_props.number_schema.optional();

const top_category_schema: joi.StringSchema<string> =
  common_schema_props.string_schema
    .required()
    .valid("Featured", "Bestseller", "Highest-rated", "Regular")
    .messages({
      "string.base": "Top category should be a string!",
      "any.only":
        "Top category should be either: 'Featured', 'Bestseller', 'Highest-rated' or 'Regular'",
      "string.empty": "Top category is required!",
    });

// validators
export const post_new_product_validate_schema: joi.ObjectSchema<product_controller_type.IPostNewProduct> =
  joi
    .object({
      name: name_schema,
      description: description_schema,
      original_price: original_price_schema,
      in_stock: in_stock_schema,
      colors: colors_schema,
      sizes: sizes_schema,
      brand: brand_schema,
      category: category_schema,
      product_type: product_type_schema,
      gender: gender_schema,
      status: status_schema,
    })
    .required();

export const put_product_by_id_validate_schema: joi.ObjectSchema<product_controller_type.IUpdateProductById> =
  joi
    .object({
      name: name_schema,
      description: description_schema,
      original_price: original_price_schema,
      in_stock: in_stock_schema,
      colors: colors_schema,
      sizes: sizes_schema,
      brand: brand_schema,
      category: category_schema,
      product_type: product_type_schema,
      gender: gender_schema,
      discount: discount_schema,
      status: status_schema,
    })
    .required();

export const patch_product_status_by_id_validate_schema: joi.ObjectSchema<product_controller_type.IUpdateProductStatusById> =
  joi
    .object({
      status: status_schema.required(),
    })
    .required();

export const get_products_by_status_validate_schema: joi.ObjectSchema<common_type.IStatus> =
  joi
    .object({
      status: status_schema.required(),
    })
    .required();

export const get_products_by_stock_validate_schema: joi.ObjectSchema<{
  stock: "in_stock" | "stockout";
}> = joi
  .object({
    stock: stock_string_schema,
  })
  .required();

export const get_products_by_top_category_validate_schema: joi.ObjectSchema<{
  top_category_name: "Featured" | "Bestseller" | "Regular" | "Highest-rated";
}> = joi
  .object({
    top_category_name: top_category_schema,
  })
  .required();

export const patch_product_stock_by_id_validate_schema: joi.ObjectSchema<{
  in_stock: number;
}> = joi
  .object({
    in_stock: in_stock_schema,
  })
  .required();
