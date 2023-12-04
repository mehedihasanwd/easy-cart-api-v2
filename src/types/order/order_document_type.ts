import mongoose from "mongoose";
import { IOrderSchema } from "./order_model_type";

export interface IOrderDocument extends mongoose.Document, IOrderSchema {
  _id: string | mongoose.Types.ObjectId;
}

export type THydratedOrderDocument = mongoose.HydratedDocument<IOrderDocument>;

export type TRemovedOrderDocument =
  mongoose.ModifyResult<THydratedOrderDocument>;
