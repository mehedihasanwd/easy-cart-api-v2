import mongoose from "mongoose";
import { IReviewSchema, IReviewModel } from "../types/review/review_model_type";

const review_schema = new mongoose.Schema<IReviewSchema, IReviewModel>(
  {
    user_name: {
      type: String,
      required: [true, "User name is required!"],
      trim: true,
    },

    user_id: {
      type: String,
      required: [true, "User id is required!"],
      trim: true,
    },

    user_image: {
      type: {
        key: {
          type: String,
          required: true,
        },

        url: {
          type: String,
          required: true,
        },
      },
      required: [true, "User image is required!"],
    },

    product_image: {
      type: {
        key: {
          type: String,
          trim: true,
        },

        url: {
          type: String,
          trim: true,
        },
      },
      default: {
        key: "",
        url: "",
      },
    },

    product_id: {
      type: String,
      required: [true, "Product id is required!"],
      trim: true,
    },

    order_id: {
      type: String,
      required: [true, "Order id is required!"],
      trim: true,
    },

    product_uid: {
      type: String,
      default: "",
      trim: true,
    },

    review: {
      type: String,
      required: [true, "Review is required!"],
      trim: true,
    },

    rating: {
      type: Number,
      max: 5,
      required: [true, "Rating is required!"],
    },
  },
  {
    timestamps: true,
  }
);

export const Review: IReviewModel = mongoose.model<IReviewSchema, IReviewModel>(
  "Review",
  review_schema
);
