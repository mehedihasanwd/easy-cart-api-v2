import { RequestHandler } from "express";
import { isNumeric } from "./../utils/numeric";
import { isValidParamsId } from "./../utils/is_valid_params_id";
import { errorReducer } from "./../utils/error_reducer";
import { UploadedFile } from "express-fileupload";
import { IOrderProduct } from "../types/order/order_model_type";
import { THydratedUserDocument } from "./../types/user/user_document_type";
import { THydratedProductDocument } from "../types/product/product_document_type";
import { THydratedReviewDocument } from "../types/review/review_document_type";
import { THydratedOrderDocument } from "../types/order/order_document_type";
import * as review_services from "../services/review_services";
import * as product_services from "../services/product_services";
import * as order_services from "../services/order_services";
import * as user_services from "../services/user_services";
import * as review_controllers_type from "../types/review/review_controllers_services_type";
import * as review_request_data_validators from "../validators/review_controllers_request_data_validator";
import * as responses from "../utils/response";
import * as amazon_s3 from "../storage/amazon_s3";
import * as amazon_s3_type from "../types/amazon_s3_type";
import * as common_type from "../types/common_type";

export const postNewReview: RequestHandler = async (req, res, next) => {
  const body = req.body;

  const { value, error } =
    review_request_data_validators.post_new_review_validate_schema.validate(
      {
        order_id: body?.order_id,
        user_id: body?.user_id,
        user_name: body?.user_name,
        user_image: {
          key: body?.user_image_key,
          url: body?.user_image_url,
        },
        product_id: body?.product_id,
        product_uid: body?.product_uid,
        review: body?.review,
        rating: isNumeric(body?.rating) ? Number(body?.rating) : undefined,
      },
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

  if (!isValidParamsId({ _id: value.user_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  if (!isValidParamsId({ _id: value.product_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  if (!isValidParamsId({ _id: value.order_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid order id! please try again using a valid one",
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "_id", value: value.user_id });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    if (
      user.image.key !== value.user_image.key ||
      user.image.url !== value.user_image.url
    ) {
      return responses.responseErrorMessage(res, 400, {
        error: "Invalid user image! please provide an valid image",
      });
    }

    const product: THydratedProductDocument | null =
      await product_services.findProductByProp({
        key: "_id",
        value: value.product_id,
      });

    if (!product) {
      return responses.responseErrorMessage(res, 400, {
        error: "Invalid product id! please try again using a valid one",
      });
    }

    const order: THydratedOrderDocument | null =
      await order_services.findOrderByProp({
        key: "_id",
        value: value.order_id,
      });

    if (!order) {
      return responses.responseErrorMessage(res, 404, {
        error: "Order not found! cannot review this product",
      });
    }

    const found_ordered_product: IOrderProduct | undefined =
      order.products.find((item) => item.product_uid === value.product_uid);

    if (!found_ordered_product) {
      return responses.responseErrorMessage(res, 400, {
        error:
          "Invalid ordered product uid! please try again using a valid one",
      });
    }

    const review: THydratedReviewDocument | null =
      await review_services.findReviewByProp({
        key: "product_uid",
        value: value.product_uid,
      });

    if (review) {
      return responses.responseErrorMessage(res, 400, {
        error: "Already reviewed!",
      });
    }

    let uploaded_product_image: common_type.IImageProps = {
      key: "",
      url: "",
    };

    if (image) {
      responses.responseImageErrorMessage(res, image);
      const cloud_image: amazon_s3_type.TS3ManagedUpload | undefined =
        await amazon_s3.uploadImageToS3({ image });

      if (!cloud_image) {
        return responses.responseErrorMessage(res, 500, {
          error:
            "Server error occurred while uploading product image! please try again",
        });
      }

      uploaded_product_image = {
        key: cloud_image.Key,
        url: cloud_image.Location,
      };
    }

    const new_review_data: review_controllers_type.ICreateNewReviewServiceParam =
      {
        data: {
          user_id: value.user_id,
          user_name: value.user_name,
          user_image: value.user_image,
          product_image: uploaded_product_image,
          product_id: value.product_id,
          order_id: value.order_id,
          product_uid: value.product_uid,
          review: value.review,
          rating: value.rating,
        },
      };

    if (!uploaded_product_image.key) {
      new_review_data.data.product_image.key = "";
      new_review_data.data.product_image.url = "";
    }

    const new_Review: THydratedReviewDocument | null =
      await review_services.createNewReview(new_review_data);

    if (!new_Review) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const total_review_average_rating: review_controllers_type.ITotalReviewsAverageRatingDataService | null =
      await review_services.totalReviewsAndAverageRatingByProductId({
        _id: value.product_id,
      });

    if (!total_review_average_rating) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    await product_services.updateTotalReviewsAndAverageRatingById({
      _id: new_Review.product_id,
      total_reviews: total_review_average_rating.total_reviews,
      average_rating: total_review_average_rating.avg_rating,
    });

    return responses.responseSuccessData(res, 201, {
      message: "Reviewed successfully",
      review: new_Review.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const getReviews: RequestHandler = async (req, res, next) => {
  const _id: string = req.query?.product_id as string;
  const is_valid_product_id: boolean = isValidParamsId({ _id });

  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  if (_id && !isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  try {
    const reviews: Array<THydratedReviewDocument> | null =
      await review_services.findReviewsByProp({
        key: is_valid_product_id ? "product_id" : "all",
        value: is_valid_product_id ? _id : "all",
        skip,
        limit,
      });

    if (!reviews) {
      return responses.responseErrorMessage(res, 404, {
        error: "Reviews not found!",
      });
    }

    const total_reviews: number = await review_services.countReviewsByProp({
      key: is_valid_product_id ? "product_id" : "all",
      value: is_valid_product_id ? _id : "all",
    });

    const total_pages: number = Math.ceil(total_reviews / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      total_pages,
      current_page,
      prev_page,
      next_page,
      reviews,
    });
  } catch (e) {
    return next(e);
  }
};

export const getReviewById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.reviewId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid review _id! please try again using a valid one",
    });
  }

  try {
    const review: THydratedReviewDocument | null =
      await review_services.findReviewByProp({ key: "_id", value: _id });

    if (!review) {
      return responses.responseErrorMessage(res, 404, {
        error: "Review not found!",
      });
    }

    return res.status(200).json({ review: review.toJSON() });
  } catch (e) {
    return next(e);
  }
};

export const putReviewById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.reviewId as string;
  const body = req.body;

  const { value, error } =
    review_request_data_validators.put_review_by_id_validate_schema.validate(
      {
        user_id: body?.user_id,
        product_id: body?.product_id,
        product_uid: body?.product_uid,
        review: body?.review,
        rating: body?.rating,
      },
      {
        abortEarly: false,
      }
    );

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid review id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  if (!isValidParamsId({ _id: value.user_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  if (!isValidParamsId({ _id: value.product_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product unique id! please try again using a valid one",
    });
  }

  if (!isValidParamsId({ _id: value.product_uid })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product unique id! please try again using a valid one",
    });
  }

  try {
    const review: THydratedReviewDocument | null =
      await review_services.findReviewByProp({ key: "_id", value: _id });

    if (!review) {
      return responses.responseErrorMessage(res, 404, {
        error: "Review not found!",
      });
    }

    const found_review_by_uid: THydratedReviewDocument | null =
      await review_services.findReviewByProp({
        key: "product_uid",
        value: value.product_uid,
      });

    if (!found_review_by_uid) {
      return responses.responseErrorMessage(res, 404, {
        error: "Review not found with the provided unique product id!",
      });
    }

    const updated_review: THydratedReviewDocument | null =
      await review_services.updateProductReviewById({
        _id,
        data: { ...value },
      });

    if (!updated_review) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const total_review_average_rating: review_controllers_type.ITotalReviewsAverageRatingDataService | null =
      await review_services.totalReviewsAndAverageRatingByProductId({
        _id: value.product_id,
      });

    if (!total_review_average_rating) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    const found_product_by_id: THydratedProductDocument | null =
      await product_services.findProductByProp({
        key: "_id",
        value: value.product_id,
      });

    if (found_product_by_id) {
      await product_services.updateTotalReviewsAndAverageRatingById({
        _id: updated_review.product_id,
        average_rating: total_review_average_rating.avg_rating,
        total_reviews: total_review_average_rating.total_reviews,
      });
    }

    return res
      .status(200)
      .json({ message: "Review updated successfully", review: updated_review });
  } catch (e) {
    return next(e);
  }
};

export const deleteReviewById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.reviewId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid review _id! please try again using a valid one",
    });
  }

  try {
    const review: THydratedReviewDocument | null =
      await review_services.findReviewByProp({ key: "_id", value: _id });

    if (!review) {
      return responses.responseErrorMessage(res, 404, {
        error: "Review not found!",
      });
    }

    if (review.product_image.key) {
      await amazon_s3.removeImageFromS3({
        image_key: review.product_image.key,
      });
    }

    await review_services.removeReviewById({ _id });

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (e) {
    return next(e);
  }
};
