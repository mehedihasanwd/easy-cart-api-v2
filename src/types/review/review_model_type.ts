import mongoose from "mongoose";
import * as common_type from "../common_type";

export interface IReviewAndRating {
  review: string;
  rating: number;
}

export interface IReview extends IReviewAndRating {
  user_name: string;
  user_image: common_type.IImageProps;
  user_id: string;
  product_id: string;
  product_uid: string;
  order_id: string;
}

export interface IReviewSchema extends IReview {
  product_image: common_type.IImageProps;
}

export interface IReviewModel extends mongoose.Model<IReviewSchema> {}
