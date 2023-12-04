import { RequestHandler } from "express";
import { errorReducer } from "../utils/error_reducer";
import { isValidParamsId } from "../utils/is_valid_params_id";
import { UploadedFile } from "express-fileupload";
import { isNumeric, toNumberOrFalse } from "../utils/numeric";
import { THydratedProductDocument } from "../types/product/product_document_type";
import * as text_converter from "./../utils/text_converter";
import * as amazon_s3 from "../storage/amazon_s3";
import * as amazon_s3_type from "../types/amazon_s3_type";
import * as product_services from "../services/product_services";
import * as order_services from "../services/order_services";
import * as product_request_data_validators from "../validators/product_controllers_request_data_validator";
import * as responses from "../utils/response";
import * as order_services_type from "../types/order/order_controllers_services_type";

export const postNewProduct: RequestHandler = async (req, res, next) => {
  const body = req.body;
  const is_discount_number: boolean = isNumeric(body?.discount);
  const discount_number: number = is_discount_number
    ? Number(body?.discount)
    : 0;
  const image: UploadedFile = req.files?.image as UploadedFile;

  const { value, error } =
    product_request_data_validators.post_new_product_validate_schema.validate(
      {
        name: body?.name,
        description: body?.description,
        original_price: toNumberOrFalse(body?.original_price),
        in_stock: toNumberOrFalse(body?.in_stock),
        colors: body?.colors
          ? text_converter.convertTextToTags(body.colors)
          : undefined,
        sizes: body?.sizes
          ? text_converter.convertStringToSizes(body.sizes)
          : undefined,
        brand: body?.brand,
        category: body?.category,
        product_type: body?.product_type,
        gender: body?.gender,
        status: body?.status,
      },
      { abortEarly: false }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  if (!is_discount_number) {
    return responses.responseErrorMessage(res, 400, {
      error: "Discount should be a valid number!",
    });
  }

  if (is_discount_number && (discount_number < 5 || discount_number > 15)) {
    return responses.responseErrorMessage(res, 400, {
      error: "Discount should not be less than 5% and not exceed 15%",
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({
        key: "name",
        value: value.name,
      });

    if (product) {
      return responses.responseErrorMessage(res, 400, {
        error: "Product is already exists! name should be unique",
      });
    }

    const image_error_response: responses.TImageErrorResponse | undefined =
      await responses.responseImageErrorMessage(res, image);

    if (image_error_response) return image_error_response;

    const cloud_image: amazon_s3_type.TS3ManagedUpload | undefined =
      await amazon_s3.uploadImageToS3({ image });

    if (!cloud_image) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    const discount_amount: number | undefined = discount_number
      ? discount_number * (value.original_price / 100)
      : undefined;

    const new_product: THydratedProductDocument | null =
      await product_services.createNewProduct({
        data: {
          ...value,
          slug: text_converter.convertTextToUrl(value.name),
          image: {
            key: cloud_image.Key,
            url: amazon_s3.cloudfrontImageUrl({ cloud_image }),
          },
          price: discount_amount
            ? value.original_price - discount_amount
            : value.original_price,
          discount: is_discount_number ? Number(body.discount) : 0,
          status: value.status ? value.status : "active",
        },
      });

    if (!new_product) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    return responses.responseSuccessData(res, 201, {
      message: "Created successfully",
      product: new_product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const getProducts: RequestHandler = async (req, res, next) => {
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const products: Array<THydratedProductDocument> | null =
      await product_services.findProducts({ skip, limit });

    if (!products) {
      return responses.responseErrorMessage(res, 404, {
        error: "No products found!",
      });
    }

    const total_products: number = await product_services.countProducts({
      key: "all",
      value: "all",
    });

    const total_pages: number = Math.ceil(total_products / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getProductsByStatus: RequestHandler = async (req, res, next) => {
  const { value, error } =
    product_request_data_validators.get_products_by_status_validate_schema.validate(
      {
        status: req.query?.status,
      }
    );

  if (error) {
    return responses.responseErrorMessage(res, 400, {
      error: error.details[0].message,
    });
  }

  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const products: Array<THydratedProductDocument> | null =
      await product_services.findProductsByStatus({
        status: value.status,
        skip,
        limit,
      });

    if (!products) {
      return responses.responseErrorMessage(res, 404, {
        error: "Products not found!",
      });
    }

    const total_products: number = await product_services.countProducts({
      key: "status",
      value: value.status,
    });

    const total_pages: number = Math.ceil(total_products / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getProductsByDiscount: RequestHandler = async (req, res, next) => {
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const proudcts: Array<THydratedProductDocument> | null =
      await product_services.findProductsByDiscount({ skip, limit });

    if (!proudcts) {
      return responses.responseErrorMessage(res, 404, {
        error: "Products not found!",
      });
    }

    const total_products: number = await product_services.countProducts({
      key: "discount",
      value: "discount",
    });

    const total_pages: number = Math.ceil(total_products / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      proudcts,
    });
  } catch (e) {
    return next(e);
  }
};

export const getProductsByStock: RequestHandler = async (req, res, next) => {
  const { value, error } =
    product_request_data_validators.get_products_by_stock_validate_schema.validate(
      {
        stock: req.query?.stock,
      }
    );

  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const products: Array<THydratedProductDocument> | null =
      await product_services.findProductsByStock({
        stock: value.stock,
        skip,
        limit,
      });

    if (!products) {
      return responses.responseErrorMessage(res, 404, {
        error: "Products not found!",
      });
    }

    const total_products: number = await product_services.countProducts({
      key: "stock_count",
      value: value.stock,
    });

    const total_pages: number = Math.ceil(total_products / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getProductsByTopCategory: RequestHandler = async (
  req,
  res,
  next
) => {
  const { value, error } =
    product_request_data_validators.get_products_by_top_category_validate_schema.validate(
      {
        top_category_name: req.query?.top_category_name,
      }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const products: Array<THydratedProductDocument> | null =
      await product_services.findProductsByTopCategory({
        top_category:
          value.top_category_name === "Highest-rated"
            ? "Highest rated"
            : value.top_category_name,
        skip,
        limit,
      });

    if (!products) {
      return responses.responseErrorMessage(res, 404, {
        error: "Products not found!",
      });
    }

    const total_products: number = await product_services.countProducts({
      key: "top_category",
      value:
        value.top_category_name === "Highest-rated"
          ? "Highest rated"
          : value.top_category_name,
    });

    const total_pages: number = Math.ceil(total_products / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getProductById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.productId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({ key: "_id", value: _id });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    return responses.responseSuccessData(res, 200, {
      product: product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const getProductBySlug: RequestHandler = async (req, res, next) => {
  const slug: string = req.params?.slug as string;

  if (!slug) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid slug! please try again using a valid one",
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({
        key: "slug",
        value: slug,
      });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    return responses.responseSuccessData(res, 200, {
      product: product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const patchProductImageById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.productId;
  const image: UploadedFile = req.files?.image as UploadedFile;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({ key: "_id", value: _id });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    const image_error_response: responses.TImageErrorResponse | undefined =
      await responses.responseImageErrorMessage(res, image);

    if (image_error_response) return image_error_response;

    await amazon_s3.removeImageFromS3({ image_key: product.image.key });
    const cloud_image: amazon_s3_type.TS3ManagedUpload | undefined =
      await amazon_s3.uploadImageToS3({ image });

    if (!cloud_image) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    const updated_product: THydratedProductDocument | null =
      await product_services.updateProductImageById({
        _id,
        data: {
          key: cloud_image.Key,
          url: amazon_s3.cloudfrontImageUrl({ cloud_image }),
        },
      });

    if (!updated_product) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    const ordered_products_by_id: Array<order_services_type.IOrderedProductDataService> | null =
      await order_services.findOrderedProductsByProp({
        key: "product_id",
        value: updated_product._id,
      });

    if (ordered_products_by_id) {
      await order_services.updateOrderedProductImageById({
        product_id: _id,
        image: {
          key: updated_product.image.key,
          url: updated_product.image.url,
        },
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Image updated successfully",
      product: updated_product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const patchProductStatusById: RequestHandler = async (
  req,
  res,
  next
) => {
  const _id: string = req.params?.productId;
  const { value, error } =
    product_request_data_validators.patch_product_status_by_id_validate_schema.validate(
      {
        status: req.body?.status,
      }
    );

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessage(res, 400, {
      error: error.details[0].message,
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({ key: "_id", value: _id });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    if (product.status === value.status) {
      return responses.responseErrorMessage(res, 400, {
        error: `Product status is already ${value.status}`,
      });
    }

    const updated_product: THydratedProductDocument | null =
      await product_services.updateProductStatusById({
        _id,
        status: value.status,
      });

    if (!updated_product) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Status updated successfully",
      product: updated_product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const putProductById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.productId;
  const body = req.body;
  const is_discount_number: boolean = isNumeric(body?.discount);
  const discount_number: number = is_discount_number
    ? Number(body?.discount)
    : 0;

  const { value, error } =
    product_request_data_validators.put_product_by_id_validate_schema.validate(
      {
        name: body?.name,
        description: body?.description,
        original_price: toNumberOrFalse(body?.original_price),
        in_stock: toNumberOrFalse(body?.in_stock),
        colors: body?.colors
          ? text_converter.convertTextToTags(body.colors)
          : undefined,
        sizes: body?.sizes
          ? text_converter.convertStringToSizes(body.sizes)
          : undefined,
        brand: body?.brand,
        category: body?.category,
        product_type: body?.product_type,
        gender: body?.gender,
        status: body?.status,
      },
      { abortEarly: false }
    );

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  if (error) {
    const errors = { errors: errorReducer(error.details) };
    return responses.responseErrorMessages(res, 400, errors);
  }

  if (!is_discount_number) {
    return responses.responseErrorMessage(res, 400, {
      error: "Discount should be a valid number!",
    });
  }

  if (is_discount_number && (discount_number < 5 || discount_number > 15)) {
    return responses.responseErrorMessage(res, 400, {
      error: "Discount should not be less than 5% and not exceed 15%",
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({ key: "_id", value: _id });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    const discount_amount: number | undefined = discount_number
      ? discount_number * (value.original_price / 100)
      : undefined;

    const updated_product: THydratedProductDocument | null =
      await product_services.updateProductById({
        _id,
        data: {
          ...value,
          slug: text_converter.convertTextToUrl(value.name),
          price: discount_amount
            ? value.original_price - discount_amount
            : value.original_price,
          discount: is_discount_number ? Number(body.discount) : 0,
          status: value.status ? value.status : "active",
        },
      });

    if (!updated_product) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Updated successfully",
      product: updated_product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const deleteProductById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.productId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }
  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({ key: "_id", value: _id });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    const ordered_products_by_id: Array<order_services_type.IOrderedProductDataService> | null =
      await order_services.findOrderedProductsByProp({
        key: "product_id",
        value: product._id,
      });

    if (!ordered_products_by_id) {
      await amazon_s3.removeImageFromS3({ image_key: product.image.key });
    }

    await product_services.removeProductById({ _id });

    return responses.responseSuccessMessage(res, 200, {
      message: "Deleted successfully",
    });
  } catch (e) {
    return next(e);
  }
};

export const patchProductDiscountById: RequestHandler = async (
  req,
  res,
  next
) => {
  const _id = req.params?.productId as string;
  const body = req.body;
  const is_discount_number: boolean = isNumeric(body?.discount);
  const discount_number: number = is_discount_number
    ? Number(body?.discount)
    : 0;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  if (!body?.discount) {
    return responses.responseErrorMessage(res, 400, {
      error: "Discount is required!",
    });
  }

  if (!is_discount_number) {
    return responses.responseErrorMessage(res, 400, {
      error: "Discount should be a valid number!",
    });
  }

  if (is_discount_number && (discount_number < 5 || discount_number > 15)) {
    return responses.responseErrorMessage(res, 400, {
      error: "Discount should not be less than 5% and not exceed 15%",
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({ key: "_id", value: _id });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    const discount_amount: number | undefined = discount_number
      ? discount_number * (product.original_price / 100)
      : undefined;

    const updated_product: THydratedProductDocument | null =
      await product_services.updateProductDiscountById({
        _id,
        data: {
          price: discount_amount
            ? product.original_price - discount_amount
            : product.original_price,
          discount: discount_number,
        },
      });

    if (!updated_product) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Discount value updated successfully",
      product: updated_product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const patchProductStockById: RequestHandler = async (req, res, next) => {
  const _id = req.params?.productId as string;
  const { value, error } =
    product_request_data_validators.patch_product_stock_by_id_validate_schema.validate(
      {
        in_stock: req.body?.in_stock,
      }
    );

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({ key: "_id", value: _id });

    if (!product) {
      return responses.responseErrorMessage(res, 404, {
        error: "Product not found!",
      });
    }

    const updated_product: THydratedProductDocument | null =
      await product_services.updateProductStockById({
        _id,
        in_stock: value.in_stock,
      });

    if (!updated_product) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred while uploading image! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Stock updated successfully",
      product: updated_product.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};
