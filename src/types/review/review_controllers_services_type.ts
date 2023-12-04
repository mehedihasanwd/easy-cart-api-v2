import mongoose from "mongoose";
import { IReview, IReviewAndRating, IReviewSchema } from "./review_model_type";
import * as common_type from "../common_type";

// controllers type
export interface IPostNewReview extends IReview {}

export interface IUpdateReviewById extends IReviewAndRating {
  user_id: string;
  order_id: string;
  product_id: string;
  product_uid: string;
}

// services type
export interface ICreateNewReviewServiceParam {
  data: IReviewSchema;
}

export interface IFindReviewByPropServiceParam {
  key: "product_id" | "_id" | "product_uid" | "order_id";
  value: string | mongoose.Types.ObjectId;
}

export interface IFindReviewsByPropServiceParam
  extends common_type.ISkipLimitOptional {
  key: "all" | "product_id" | "user_id" | "order_id";
  value: "all" | string | mongoose.Types.ObjectId;
}

export interface ICountReviewsByPropService {
  key: "product_id" | "all" | "order_id";
  value: mongoose.Types.ObjectId | "all" | string;
}

export interface ITotalReviewsAverageRatingServiceParam {
  total_reviews: number;
  avg_rating: number;
}

export interface IUpdateReviewByIdServiceParam extends common_type.IDocumentId {
  data: {
    user_id: string;
    product_uid: string;
    review: string;
    rating: number;
  };
}

export interface IUpdateUserImageByIdServiceParam
  extends common_type.IDocumentId,
    common_type.IImage {}

export interface IUpdateUserNameByIdServiceParam
  extends common_type.IDocumentId {
  user_name: string;
}

export interface IReviewsRating {
  _id: null;
  total_reviews: number;
  avg_rating: number;
}
