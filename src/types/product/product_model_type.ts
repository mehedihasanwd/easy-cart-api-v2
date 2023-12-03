import mongoose from "mongoose";
import * as common_type from "../common_type";

export interface IProduct
  extends common_type.IName,
    common_type.IDescription,
    common_type.IOriginalPrice,
    common_type.IProductType,
    common_type.IGender,
    common_type.ICategory {
  in_stock: number;
  colors: string[];
  sizes: common_type.TSize[];
  brand: string;
}

export interface IProductSchema
  extends IProduct,
    common_type.IImage,
    common_type.IStatus,
    common_type.ISlug {
  discount: number;
  price: number;
  average_rating: number;
  total_reviews: number;
  sales: number;
  top_category: common_type.TTopCategory;
}

export interface IProductModel extends mongoose.Model<IProductSchema> {}
