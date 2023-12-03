import mongoose from "mongoose";
import {
  IProductSchema,
  IProductModel,
} from "../types/product/product_model_type";

export const product_schema = new mongoose.Schema<
  IProductSchema,
  IProductModel
>(
  {
    name: {
      type: String,
      required: [true, "Product name is required!"],
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Product slug is required!"],
      unique: true,
      trim: true,
    },

    image: {
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
      default: {
        key: "",
        url: "",
      },
    },

    description: {
      type: String,
      required: [true, "Product description is required!"],
      trim: true,
    },

    original_price: {
      type: Number,
      min: 19,
      required: [true, "Orginal product price is required!"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required!"],
    },

    discount: {
      type: Number,
      required: true,
      max: 15,
      default: 0,
    },

    in_stock: {
      type: Number,
      required: [true, "Product stock amount is required!"],
    },

    colors: {
      type: [String],
      required: [true, "Product colors is required!"],
    },

    sizes: {
      type: [String],
      enum: ["S", "M", "L", "XL"],
      required: [true, "Product sizes is required!"],
    },

    brand: {
      type: String,
      required: [true, "Product brand is required!"],
      trim: true,
    },

    category: {
      type: String,
      enum: ["men", "women", "boy", "girl", "sports"],
      required: true,
      trim: true,
    },

    product_type: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["man", "woman", "unisex"],
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      trim: true,
    },

    average_rating: {
      type: Number,
      default: 0,
    },

    total_reviews: {
      type: Number,
      default: 0,
    },

    sales: {
      type: Number,
      default: 0,
    },

    top_category: {
      type: String,
      enum: ["Featured", "Bestseller", "Highest rated", "Regular"],
      default: "Regular",
    },
  },
  { timestamps: true }
);

product_schema.index({
  name: 1,
  slug: 1,
  status: 1,
  stock: 1,
  discount: 1,
  top_category: 1,
});

export const Product: IProductModel = mongoose.model<
  IProductSchema,
  IProductModel
>("Product", product_schema);
