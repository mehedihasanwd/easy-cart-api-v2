import { IProduct } from "./product_model_type";
import * as common_type from "../common_type";

// controllers type
export interface IPostNewProduct extends IProduct {
  discount?: number;
  status?: common_type.TStatus;
}

export interface IUpdateProductById
  extends common_type.IDocumentId,
    IPostNewProduct {}

export interface IUpdateProductStatusById
  extends common_type.IDocumentId,
    common_type.IStatus {}

// Services type
export interface IFindProductByProp extends common_type.IValue {
  key: "_id" | "slug" | "name";
}

export interface IFindProducts extends common_type.ISkipLimitOptional {}

interface ICreateProduct {
  name: string;
  slug: string;
  image: common_type.IImageProps;
  description: string;
  original_price: number;
  price: number;
  discount: number;
  in_stock: number;
  colors: string[];
  sizes: common_type.TSize[];
  brand: string;
  category: common_type.TCategory;
  product_type: string;
  gender: common_type.TGender;
  status: common_type.TStatus;
}

export interface ICreateNewProductData {
  data: ICreateProduct;
}

export interface ICreateNewProductsData {
  data: ICreateProduct[];
}

export interface IFindProductsByTopCategory
  extends common_type.ISkipLimitOptional {
  top_category: common_type.TTopCategory;
}

type TCountProductsKey =
  | "top_category"
  | "discount"
  | "stock_count"
  | "status"
  | "all";

type TCountProductsValue =
  | common_type.TTopCategory
  | "discount"
  | "active"
  | "inactive"
  | "in_stock"
  | "stockout"
  | "all";

export interface ICountProducts {
  key: TCountProductsKey;
  value: TCountProductsValue;
}

export interface IUpdateProductStatusById
  extends common_type.IDocumentId,
    common_type.IStatus {}

export interface IUpdateProductByIdData extends common_type.IDocumentId {
  data: {
    name: string;
    slug: string;
    description: string;
    original_price: number;
    price: number;
    in_stock: number;
    discount: number;
    status: common_type.TStatus;
    colors: string[];
    sizes: common_type.TSize[];
    brand: string;
    category: common_type.TCategory;
    product_type: string;
    gender: common_type.TGender;
  };
}

export interface IUpdateProductTotalReviewsAndAverageRatingById
  extends common_type.IDocumentId {
  total_reviews: number;
  average_rating: number;
}

export interface IUpdateProductSalesAndStockById
  extends common_type.IDocumentId {
  sales: number;
}

export interface IFindProductsByStatus
  extends common_type.ISkipLimitOptional,
    common_type.IStatus {}

export interface IFindProductsByStock extends common_type.ISkipLimitOptional {
  stock: "in_stock" | "stockout";
}

export interface IUpdateProductStockById extends common_type.IDocumentId {
  in_stock: number;
}

export interface IFindProductsByDiscount
  extends common_type.ISkipLimitOptional {}

export interface IUpdateProductImageByIdData extends common_type.IDocumentId {
  data: common_type.IImageProps;
}

export interface IUpdateProductDiscountById extends common_type.IDocumentId {
  data: {
    discount: number;
    price: number;
  };
}
