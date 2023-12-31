import * as common_type from "../common_type";

// controllers type
export interface IPostNewCategory
  extends common_type.ICategoryName,
    common_type.IDescription {}

export interface ICategoryStatus extends common_type.IStatus {}

// services type
export interface IFindCategoryByPropServiceParam extends common_type.IValue {
  key: "_id" | "name" | "status";
}

export interface ICreateNewCategoryServiceParam {
  data: {
    name: string;
    description: string;
    slug: string;
    image: common_type.IImageProps;
  };
}

export interface IUpdateCategoryImageByIdServiceParam
  extends common_type.IDocumentId,
    common_type.IImage {}

export interface IUpdateCategoryStatusByIdServiceParam
  extends common_type.IDocumentId,
    common_type.IStatus {}

export interface IUpdateCategoryByIdServiceParam
  extends common_type.IDocumentId {
  data: {
    name: string;
    description: string;
    slug: string;
  };
}
