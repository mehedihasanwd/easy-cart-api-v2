import mongoose from "mongoose";
import { IProductSchema } from "./product_model_type";

export interface IProductDocument extends mongoose.Document, IProductSchema {
  _id: string | mongoose.Types.ObjectId;
}

export type THydratedProductDocument =
  mongoose.HydratedDocument<IProductDocument>;

export type TRemovedProductDocument =
  mongoose.ModifyResult<THydratedProductDocument>;
