import mongoose from "mongoose";
import Stripe from "stripe";
import * as common_type from "../common_type";
import { TOrderStatus, IShippingAddress } from "./order_model_type";

export interface IOrderStatus {
  status: TOrderStatus;
}

// controllers type
export interface IPostOrderProduct
  extends common_type.IOrderProductId,
    common_type.IName,
    common_type.ISlug,
    common_type.IDescription,
    common_type.IPrice,
    common_type.IQuantity,
    common_type.IColor,
    common_type.ISize,
    common_type.IBrand,
    common_type.ICategory,
    common_type.IProductType,
    common_type.IImage,
    common_type.IGender {}

export interface IPostNewOrder {
  user_id: string;
  products: IPostOrderProduct[];
  shipping_address: IShippingAddress;
}

// services type
export interface IFindOrderByPropServiceParam extends common_type.IValue {
  key: "_id" | "user_id";
}

export type TStripePaymentIntent = Stripe.Response<Stripe.PaymentIntent>;

export interface IPlacedNewOrderProduct extends IPostOrderProduct {
  order_id: string;
  product_uid: mongoose.Types.ObjectId | string;
}

export interface ICreateNewOrderServiceParam {
  data: {
    user_id: string;
    products: IPostOrderProduct[];
    shipping_address: IShippingAddress;
  };
}

export interface ICountOrdersByPropServiceParam {
  key: "all" | "user_id" | "status" | "product_id";
  value: "all" | string;
}

export interface IUpdateOrderStatusByIdServiceParam
  extends common_type.IDocumentId {
  status: TOrderStatus;
}

export interface IOrderedProductDataService
  extends common_type.IName,
    common_type.ISlug,
    common_type.IDescription,
    common_type.IPrice,
    common_type.IQuantity,
    common_type.IColor,
    common_type.ISize,
    common_type.IBrand,
    common_type.ICategory,
    common_type.IProductType,
    common_type.IGender,
    common_type.IOrderProductId {
  image: {
    key: string;
    url: string;
    _id: mongoose.Types.ObjectId;
  };
  _id: mongoose.Types.ObjectId | string;
  ordered_at: Date;
  order_id: string;
  product_uid: string;
}

export interface IUpdateOrderedProductImageByIdServiceParam
  extends common_type.IOrderProductId,
    common_type.IImage {}

export interface IFindOrdersByPropServiceParam
  extends common_type.ISkipLimitOptional {
  key: "all" | "product_id" | "user_id";
  value: "all" | string | mongoose.Types.ObjectId;
}

export interface IFindOrderedProductsByPropServiceParam
  extends common_type.ISkipLimitOptional {
  key: "all" | "user_id" | "order_id" | "product_id";
  value: "all" | string | mongoose.Types.ObjectId;
}

export interface ICountOrderedProductsByPropServiceParam {
  key: "all" | "user_id" | "order_id" | "product_id";
  value: "all" | string | mongoose.Types.ObjectId;
}
