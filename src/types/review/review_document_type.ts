import mongoose from "mongoose";
import { IReviewSchema } from "./review_model_type";

export interface IReviewDocument extends mongoose.Document, IReviewSchema {
  _id: string | mongoose.Types.ObjectId;
}

export type THydratedReviewDocument =
  mongoose.HydratedDocument<IReviewDocument>;

export type TRemodedReviewDocument =
  mongoose.ModifyResult<THydratedReviewDocument>;
