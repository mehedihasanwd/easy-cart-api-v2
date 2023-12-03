import mongoose from "mongoose";
import { IStaffMethods } from "../user_and_staff/document_methods_type";
import { IStaffSchema } from "./staff_model_type";

export interface IStaffDocument
  extends mongoose.Document,
    IStaffSchema,
    IStaffMethods {
  _id: mongoose.Types.ObjectId;
}

export type THydratedStaffDocument = mongoose.HydratedDocument<IStaffDocument>;

export type TRemovedStaffDocument =
  mongoose.ModifyResult<THydratedStaffDocument>;
