import { Category } from "../models/Category";
import {
  THydratedCategoryDocument,
  TRemovedCategoryDocument,
} from "./../types/category/category_document_type";
import * as category_services_type from "../types/category/category_controllers_services_type";
import * as common_type from "../types/common_type";

export const findCategoryByProp = async ({
  key,
  value,
}: category_services_type.IFindCategoryByPropServiceParam): Promise<THydratedCategoryDocument | null> => {
  if (key === "_id") {
    return await Category.findById(value);
  }

  return await Category.findOne({ [key]: value });
};

export const createNewCategory = async ({
  data,
}: category_services_type.ICreateNewCategoryServiceParam): Promise<THydratedCategoryDocument | null> => {
  const new_category: THydratedCategoryDocument | null = new Category({
    ...data,
  });

  if (!new_category) return null;

  return new_category.save();
};

export const findCategories = async ({
  skip,
  limit,
}: common_type.ISkipLimitOptional): Promise<Array<THydratedCategoryDocument> | null> => {
  const categories: Array<THydratedCategoryDocument> | null =
    skip && limit
      ? await Category.aggregate([{ $skip: skip }, { $limit: limit }])
      : await Category.find();

  if (!categories || categories.length === 0) return null;

  return categories;
};

export const coundCategories = async (): Promise<number> => {
  return await Category.countDocuments({});
};

export const updateCategoryImageById = async ({
  _id,
  image,
}: category_services_type.IUpdateCategoryImageByIdServiceParam): Promise<THydratedCategoryDocument | null> => {
  const updated_category: THydratedCategoryDocument | null =
    await Category.findByIdAndUpdate(
      _id,
      {
        $set: { image },
      },
      { new: true }
    );

  if (!updated_category) return null;

  return updated_category.save();
};

export const updateCategoryStatusById = async ({
  _id,
  status,
}: category_services_type.IUpdateCategoryStatusByIdServiceParam): Promise<THydratedCategoryDocument | null> => {
  const updated_category: THydratedCategoryDocument | null =
    await Category.findByIdAndUpdate(
      _id,
      {
        $set: { status },
      },
      { new: true }
    );

  if (!updated_category) return null;

  return updated_category.save();
};

export const updateCategoryById = async ({
  _id,
  data,
}: category_services_type.IUpdateCategoryByIdServiceParam): Promise<THydratedCategoryDocument | null> => {
  const updated_category: THydratedCategoryDocument | null =
    await Category.findByIdAndUpdate(
      _id,
      {
        $set: { ...data },
      },
      { new: true }
    );

  if (!updated_category) return null;

  return updated_category.save();
};

export const removeCategoryById = async ({
  _id,
}: common_type.IDocumentId): Promise<TRemovedCategoryDocument> => {
  return await Category.findByIdAndDelete(_id);
};
