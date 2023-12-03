import mongoose from "mongoose";
import * as common_type from "../common_type";

export interface ICategorySchema
  extends common_type.ICategoryName,
    common_type.IImage,
    common_type.IDescription,
    common_type.ISlug,
    common_type.IStatus {}

export interface ICategoryModel extends mongoose.Model<ICategorySchema> {}
