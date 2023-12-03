import mongoose from "mongoose";
import { IUserMethods } from "../user_and_staff/document_methods_type";
import { IUserSchema } from "./user_model_type";
import * as common_type from "../common_type";

export interface IUserDocument
  extends mongoose.Document,
    IUserSchema,
    IUserMethods,
    common_type.IDocumentId {
  _id: mongoose.Types.ObjectId;
}

export type THydratedUserDocument = mongoose.HydratedDocument<IUserDocument>;

export type TRemovedUserDocuement =
  mongoose.ModifyResult<THydratedUserDocument>;
