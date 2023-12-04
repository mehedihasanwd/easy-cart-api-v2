import { Product } from "../models/Product";
import {
  THydratedProductDocument,
  TRemovedProductDocument,
} from "../types/product/product_document_type";
import * as product_services_type from "../types/product/product_controllers_services_type";
import * as common_type from "../types/common_type";

export const findProductByProp = async ({
  key,
  value,
}: product_services_type.IFindProductByPropServiceParam): Promise<THydratedProductDocument | null> => {
  if (key === "_id") {
    return await Product.findById(value);
  }

  return await Product.findOne({ [key]: value });
};

export const createNewProduct = async ({
  data,
}: product_services_type.ICreateNewProductServiceParam): Promise<THydratedProductDocument | null> => {
  const new_product: THydratedProductDocument | null =
    data.discount >= 5 && data.discount <= 15
      ? new Product({ ...data })
      : new Product({
          ...data,
          discount: 0,
        });

  if (!new_product) return null;

  return new_product.save();
};

export const findProducts = async ({
  skip,
  limit,
}: product_services_type.IFindProductsServiceParam): Promise<Array<THydratedProductDocument> | null> => {
  const products: Array<THydratedProductDocument> | null =
    skip && limit
      ? await Product.aggregate([
          {
            $skip: skip,
          },

          {
            $limit: limit,
          },

          { $sort: { _id: -1 } },
        ])
      : await Product.aggregate([{ $sort: { _id: -1 } }]);

  if (!products || products.length === 0) return null;

  return products;
};

export const findProductsByTopCategory = async ({
  top_category,
  skip,
  limit,
}: product_services_type.IFindProductsByTopCategoryServiceParam): Promise<Array<THydratedProductDocument> | null> => {
  const products: Array<THydratedProductDocument> | null =
    skip && limit
      ? await Product.aggregate([
          {
            $match: { top_category, in_stock: { $gte: 1 }, status: "active" },
          },

          {
            $skip: skip,
          },

          {
            $limit: limit,
          },

          { $sort: { _id: -1 } },
        ])
      : await Product.aggregate([{ $sort: { _id: -1 } }]);

  if (!products || products.length === 0) return null;

  return products;
};

export const findProductsByStatus = async ({
  status,
  skip,
  limit,
}: product_services_type.IFindProductsByStatusServiceParam): Promise<Array<THydratedProductDocument> | null> => {
  const products: Array<THydratedProductDocument> | null =
    skip && limit
      ? await Product.aggregate([
          {
            $match: { status },
          },

          { $skip: skip },

          { $limit: limit },
        ])
      : await Product.aggregate([{ $match: { status } }]);

  if (!products || products.length === 0) return null;

  return products;
};

export const findProductsByStock = async ({
  stock,
  skip,
  limit,
}: product_services_type.IFindProductsByStockServiceParam): Promise<Array<THydratedProductDocument> | null> => {
  const products: Array<THydratedProductDocument> | null =
    skip && limit
      ? await Product.aggregate([
          {
            $match: {
              in_stock: stock === "in_stock" ? { $gte: 1 } : { $lt: 1 },
            },
          },

          { $skip: skip },

          { $limit: limit },
        ])
      : await Product.aggregate([
          {
            $match: {
              in_stock: stock === "in_stock" ? { $gte: 1 } : { $lt: 1 },
            },
          },
        ]);

  if (!products || products.length === 0) return null;

  return products;
};

export const findProductsByDiscount = async ({
  skip,
  limit,
}: product_services_type.IFindProductsByDiscountServiceParam): Promise<Array<THydratedProductDocument> | null> => {
  const products: Array<THydratedProductDocument> | null =
    skip && limit
      ? await Product.aggregate([
          {
            $match: { discount: { $gte: 5 } },
          },

          { $skip: skip },

          { $limit: limit },
        ])
      : await Product.aggregate([{ $match: { discount: { $gte: 5 } } }]);

  if (!products || products.length === 0) return null;

  return products;
};

export const countProducts = async ({
  key,
  value,
}: product_services_type.ICountProductsServiceParam): Promise<number> => {
  const top_category: string[] = [
    "Regular",
    "Bestseller",
    "Highest rated",
    "Featured",
  ];

  const all_status: string[] = ["active", "inactive"];

  if (key === "top_category" && top_category.includes(value)) {
    return await Product.countDocuments({ top_category: value });
  }

  if (key === "discount") {
    return await Product.countDocuments({ discount: { $gte: 5 } });
  }

  if (key === "stock_count") {
    return await Product.countDocuments({
      in_stock: value === "in_stock" ? { $gte: 1 } : { $lt: 1 },
    });
  }

  if (key === "status" && all_status.includes(value)) {
    return await Product.countDocuments({ status: value });
  }

  return key === "all" && value === "all"
    ? await Product.countDocuments({})
    : 0;
};

export const updateProductStatusById = async ({
  _id,
  status,
}: product_services_type.IUpdateProductStatusByIdServiceParam): Promise<THydratedProductDocument | null> => {
  const updated_product: THydratedProductDocument | null =
    await Product.findByIdAndUpdate(
      _id,
      {
        $set: { status },
      },
      { new: true }
    );

  if (!updated_product) return null;

  return updated_product.save();
};

export const updateProductStockById = async ({
  _id,
  in_stock,
}: product_services_type.IUpdateProductStockByIdServiceParam): Promise<THydratedProductDocument | null> => {
  const updated_product: THydratedProductDocument | null =
    await Product.findByIdAndUpdate(
      _id,
      {
        $set: { in_stock },
      },
      { new: true }
    );

  if (!updated_product) return null;

  return updated_product.save();
};

export const updateProductById = async ({
  _id,
  data,
}: product_services_type.IUpdateProductByIdServiceParam): Promise<THydratedProductDocument | null> => {
  const updated_product: THydratedProductDocument | null =
    await Product.findByIdAndUpdate(
      _id,
      {
        $set: { ...data },
      },
      { new: true }
    );

  if (!updated_product) return null;

  return updated_product.save();
};

export const updateProductImageById = async ({
  _id,
  data,
}: product_services_type.IUpdateProductImageByIdServiceParam): Promise<THydratedProductDocument | null> => {
  const updated_product: THydratedProductDocument | null =
    await Product.findByIdAndUpdate(
      _id,
      {
        $set: { image: { ...data } },
      },
      { new: true }
    );

  if (!updated_product) return null;

  return updated_product.save();
};

export const updateTotalReviewsAndAverageRatingById = async ({
  _id,
  total_reviews,
  average_rating,
}: product_services_type.IUpdateTotalReviewsAndAverageRatingByIdServiceParam): Promise<THydratedProductDocument | null> => {
  const updated_product: THydratedProductDocument | null =
    await Product.findByIdAndUpdate(
      _id,
      {
        $set: {
          total_reviews,
          average_rating,
        },
      },
      { new: true }
    );

  if (!updated_product) return null;

  return updated_product.save();
};

export const updateProductSalesAndStockById = async ({
  _id,
  sales,
}: product_services_type.IUpdateProductSalesAndStockByIdServiceParam): Promise<THydratedProductDocument | null> => {
  const updated_product: THydratedProductDocument | null =
    await Product.findByIdAndUpdate(
      _id,
      {
        $inc: {
          sales,
          in_stock: -sales,
        },
      },
      { new: true }
    );

  if (!updated_product) return null;

  return updated_product.save();
};

export const updateProductTopCategoryById = async ({
  _id,
}: common_type.IDocumentId): Promise<THydratedProductDocument | null> => {
  const product: THydratedProductDocument | null = await findProductByProp({
    key: "_id",
    value: _id.toString(),
  });

  if (!product) return null;

  if (product.average_rating >= 4.5 && product.average_rating <= 4.7) {
    product.top_category = "Featured";
    return await product.save();
  }

  if (product.average_rating >= 4.8 && product.sales < 50) {
    product.top_category = "Highest rated";
    return await product.save();
  }

  if (product.average_rating >= 4.5 && product.sales >= 50) {
    product.top_category = "Bestseller";
    return await product.save();
  }

  product.top_category = "Regular";
  return await product.save();
};

export const updateProductDiscountById = async ({
  _id,
  data,
}: product_services_type.IUpdateProductDiscountByIdServiceParam): Promise<THydratedProductDocument | null> => {
  const updated_product: THydratedProductDocument | null =
    await Product.findByIdAndUpdate(
      _id,
      {
        $set: {
          ...data,
        },
      },
      { new: true }
    );

  if (!updated_product) return null;

  return updated_product.save();
};

export const removeProductById = async ({
  _id,
}: common_type.IDocumentId): Promise<TRemovedProductDocument> => {
  return await Product.findByIdAndDelete(_id);
};
