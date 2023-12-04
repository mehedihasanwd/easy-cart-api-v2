import { RequestHandler } from "express";
import { errorReducer } from "../utils/error_reducer";
import { isValidParamsId } from "../utils/is_valid_params_id";
import { UploadedFile } from "express-fileupload";
import { THydratedCategoryDocument } from "../types/category/category_document_type";
import * as amazon_s3 from "../storage/amazon_s3";
import * as amazon_s3_type from "../types/amazon_s3_type";
import * as category_services from "../services/category_services";
import * as responses from "../utils/response";
import * as category_request_data_validators from "../validators/category_controllers_request_data_validator";

export const postNewCategory: RequestHandler = async (req, res, next) => {
  const { value, error } =
    category_request_data_validators.post_new_category_validate_schmea.validate(
      { name: req.body?.name, description: req.body?.description },
      {
        abortEarly: false,
      }
    );

  const image: UploadedFile = req.files?.image as UploadedFile;

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const category: THydratedCategoryDocument | null =
      await category_services.findCategoryByProp({
        key: "name",
        value: value.name,
      });

    if (category) {
      return responses.responseErrorMessage(res, 400, {
        error: "Category already exists! name should be unique",
      });
    }

    const image_error_response: responses.TImageErrorResponse | undefined =
      await responses.responseImageErrorMessage(res, image);

    if (image_error_response) return image_error_response;

    const cloud_image: amazon_s3_type.TS3ManagedUpload | undefined =
      await amazon_s3.uploadImageToS3({
        image,
      });

    if (!cloud_image) {
      return responses.responseErrorMessage(res, 500, {
        error: "Category already exists! name should be unique",
      });
    }

    const new_category: THydratedCategoryDocument | null =
      await category_services.createNewCategory({
        data: {
          name: value.name,
          description: value.description,
          slug: value.name,
          image: {
            key: cloud_image.Key,
            url: cloud_image.Location,
          },
        },
      });

    if (!new_category) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    return responses.responseSuccessData(res, 201, {
      message: "Created successfully",
      category: new_category.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const getCategories: RequestHandler = async (req, res, next) => {
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const categories: Array<THydratedCategoryDocument> | null =
      await category_services.findCategories({
        skip,
        limit,
      });

    if (!categories) {
      return responses.responseErrorMessage(res, 404, {
        error: "Categories not found!",
      });
    }

    const total_categories: number = await category_services.coundCategories();
    const total_pages: number = Math.ceil(total_categories / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      total_pages,
      current_page,
      prev_page,
      next_page,
      categories,
    });
  } catch (e) {
    return next(e);
  }
};

export const patchCategoryImageById: RequestHandler = async (
  req,
  res,
  next
) => {
  const _id: string = req.params?.categoryId;
  const image = req.files?.image as UploadedFile;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid category id! please try again using a one",
    });
  }

  try {
    const category: THydratedCategoryDocument | null =
      await category_services.findCategoryByProp({ key: "_id", value: _id });

    if (!category) {
      return responses.responseErrorMessage(res, 404, {
        error: "Category not found!",
      });
    }

    const image_error_response: responses.TImageErrorResponse | undefined =
      await responses.responseImageErrorMessage(res, image);

    if (image_error_response) return image_error_response;

    await amazon_s3.removeImageFromS3({ image_key: category.image.key });

    const cloud_image: amazon_s3_type.TS3ManagedUpload | undefined =
      await amazon_s3.uploadImageToS3({ image });

    if (!cloud_image) {
      return responses.responseErrorMessage(res, 500, {
        error: "Category already exists! name should be unique",
      });
    }

    const updated_category: THydratedCategoryDocument | null =
      await category_services.updateCategoryImageById({
        _id,
        image: {
          key: cloud_image.Key,
          url: amazon_s3.cloudfrontImageUrl({ cloud_image }),
        },
      });

    if (!updated_category) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Image updated successfully",
      category: updated_category.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const getCategoryById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.categoryId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid category id! please try again using a valid one",
    });
  }

  try {
    const category: THydratedCategoryDocument | null =
      await category_services.findCategoryByProp({ key: "_id", value: _id });

    if (!category) {
      return responses.responseErrorMessage(res, 404, {
        error: "Category not found!",
      });
    }

    return responses.responseSuccessData(res, 200, {
      category: category.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const patchCategoryStatusById: RequestHandler = async (
  req,
  res,
  next
) => {
  const _id: string = req.params?.categoryId;
  const { value, error } =
    category_request_data_validators.patch_category_status_validate_schema.validate(
      req.body,
      { abortEarly: false }
    );

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid category id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const category: THydratedCategoryDocument | null =
      await category_services.findCategoryByProp({ key: "_id", value: _id });

    if (!category) {
      return responses.responseErrorMessage(res, 404, {
        error: "Category not found!",
      });
    }

    if (category.status === value.status) {
      return responses.responseErrorMessage(res, 400, {
        error: `Status  is already ${value.status}`,
      });
    }

    const updated_category: THydratedCategoryDocument | null =
      await category_services.updateCategoryStatusById({
        _id,
        status: value.status,
      });

    if (!updated_category) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Status updated successfully!",
      category: updated_category.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const putCategoryById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.categoryId;
  const { value, error } =
    category_request_data_validators.post_new_category_validate_schmea.validate(
      { name: req.body?.name, description: req.body?.description },
      { abortEarly: false }
    );

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid category id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const category: THydratedCategoryDocument | null =
      await category_services.findCategoryByProp({ key: "_id", value: _id });

    if (!category) {
      return responses.responseErrorMessage(res, 404, {
        error: "Category not found!",
      });
    }

    const updated_category: THydratedCategoryDocument | null =
      await category_services.updateCategoryById({
        _id,
        data: { ...value, slug: value.name },
      });

    if (!updated_category) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: "Category updated successfully",
      category: updated_category.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const deleteCategoryById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.categoryId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid category id! please try again using a valid one",
    });
  }

  try {
    const category: THydratedCategoryDocument | null =
      await category_services.findCategoryByProp({ key: "_id", value: _id });

    if (!category) {
      return responses.responseErrorMessage(res, 404, {
        error: "Category not found!",
      });
    }

    await amazon_s3.removeImageFromS3({ image_key: category.image.key });
    await category_services.removeCategoryById({ _id });

    return responses.responseSuccessMessage(res, 200, {
      message: "Deleted successfully",
    });
  } catch (e) {
    return next(e);
  }
};
