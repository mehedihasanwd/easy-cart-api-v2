import mongoose from "mongoose";
import * as common_type from "../common_type";

export type TOrderStatus = "pending" | "processing" | "shipped" | "completed";

export interface IShippingAddress
  extends common_type.ICountry,
    common_type.ICity,
    common_type.IHouseNumberOrName,
    common_type.IPhone,
    common_type.IPostCode {}

export interface IOrderProduct
  extends common_type.IName,
    common_type.ISlug,
    common_type.IImage,
    common_type.IDescription,
    common_type.IPrice,
    common_type.ICategory,
    common_type.IProductType,
    common_type.IGender,
    common_type.IOrderProductId,
    common_type.IQuantity,
    common_type.IColor,
    common_type.ISize,
    common_type.IBrand {
  order_id: string;
  product_uid: string;
  ordered_at: mongoose.Date;
}

export interface IOrderSchema {
  user_id: string;
  products: IOrderProduct[];
  status: TOrderStatus;
  total_cost: number;
  payment_intent: string;
  client_secret: string;
  shipping_address: IShippingAddress;
}

export interface IOrderModel extends mongoose.Model<IOrderSchema> {}
