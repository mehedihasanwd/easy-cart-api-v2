import { model, Schema } from "mongoose";
import {
  ICategorySchema,
  ICategoryModel,
} from "../types/category/category_model_type";

const category_schema = new Schema<ICategorySchema, ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required!"],
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: [true, "Category description is required!"],
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Category slug is required!"],
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      trim: true,
    },

    image: {
      type: {
        key: {
          type: String,
          required: true,
          trim: true,
        },

        url: {
          type: String,
          required: true,
          trim: true,
        },
      },
      required: [true, "Category image is required!"],
    },
  },
  { timestamps: true }
);

category_schema.index({ name: 1, status: 1 });

export const Category: ICategoryModel = model<ICategorySchema, ICategoryModel>(
  "Category",
  category_schema
);
