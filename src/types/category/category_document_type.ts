import mongoose from "mongoose";
import { ICategorySchema } from "./category_model_type";

export interface ICategoryDocument extends mongoose.Document, ICategorySchema {
  _id: mongoose.Types.ObjectId;
}

export type THydratedCategoryDocument =
  mongoose.HydratedDocument<ICategoryDocument>;

export type TRemovedCategoryDocument =
  mongoose.ModifyResult<THydratedCategoryDocument>;
