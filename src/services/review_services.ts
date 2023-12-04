import {
  THydratedReviewDocument,
  TRemodedReviewDocument,
} from "./../types/review/review_document_type";
import { Review } from "./../models/Review";
import * as review_services_type from "../types/review/review_controllers_services_type";
import * as common_type from "../types/common_type";

export const findReviewByProp = async ({
  key,
  value,
}: review_services_type.IFindReviewByPropServiceParam): Promise<THydratedReviewDocument | null> => {
  if (key === "_id") {
    return await Review.findById(value);
  }

  return await Review.findOne({ [key]: value });
};

export const findReviewsByProp = async ({
  key,
  value,
  skip,
  limit,
}: review_services_type.IFindReviewsByPropServiceParam): Promise<Array<THydratedReviewDocument> | null> => {
  let reviews: Array<THydratedReviewDocument> | null = null;

  if (key !== "all") {
    reviews = await Review.aggregate(
      skip && limit
        ? [
            { $match: { [key]: value } },
            { $skip: skip },
            { $limit: limit },
            { $sort: { _id: -1 } },
          ]
        : [{ $match: { [key]: value } }, { $sort: { _id: -1 } }]
    );
  } else {
    reviews = await Review.aggregate(
      skip && limit
        ? [{ $skip: skip }, { $limit: limit }, { $sort: { _id: -1 } }]
        : [{ $sort: { _id: -1 } }]
    );
  }

  if (!reviews || reviews.length === 0) return null;

  return reviews;
};

export const createNewReview = async ({
  data,
}: review_services_type.ICreateNewReviewServiceParam): Promise<THydratedReviewDocument | null> => {
  console.log("im in create new review service");
  const new_review: THydratedReviewDocument | null = new Review({
    ...data,
  });

  if (!new_review) {
    return null;
  }

  return new_review.save();
};

export const countReviewsByProp = async ({
  key,
  value,
}: review_services_type.ICountReviewsByPropService): Promise<number> => {
  return await Review.countDocuments(key === "all" ? {} : { [key]: value });
};

export const totalReviewsAndAverageRatingByProductId = async ({
  _id,
}: common_type.IDocumentId): Promise<review_services_type.ITotalReviewsAverageRatingServiceParam | null> => {
  const data: Array<review_services_type.IReviewsRating> | null =
    await Review.aggregate([
      {
        $match: {
          product_id: _id,
        },
      },

      {
        $group: {
          _id: null,
          total_reviews: { $sum: 1 },
          avg_rating: { $avg: "$rating" },
        },
      },
    ]);

  if (!data || data.length === 0) return null;

  const { avg_rating, total_reviews }: review_services_type.IReviewsRating =
    data[0];

  return {
    avg_rating,
    total_reviews,
  };
};

export const updateProductReviewById = async ({
  _id,
  data,
}: review_services_type.IUpdateReviewByIdServiceParam): Promise<THydratedReviewDocument | null> => {
  const updated_review: THydratedReviewDocument | null =
    await Review.findByIdAndUpdate(
      _id,
      {
        $set: {
          ...data,
        },
      },
      { new: true }
    );

  if (!updated_review) return null;

  return updated_review.save();
};

export const removeReviewById = async ({
  _id,
}: common_type.IDocumentId): Promise<TRemodedReviewDocument> => {
  return await Review.findByIdAndDelete(_id);
};

export const updateUserImageById = async ({
  _id,
  image,
}: review_services_type.IUpdateUserImageByIdServiceParam): Promise<void> => {
  await Review.updateMany(
    { user_id: _id },

    {
      $set: {
        user_image: { key: image.key, url: image.url },
      },
    },

    { new: true }
  );
};

export const updateUserNameById = async ({
  _id,
  user_name,
}: review_services_type.IUpdateUserNameByIdServiceParam): Promise<void> => {
  const filter = { user_id: _id };

  const update = {
    $set: {
      user_name,
    },
  };

  await Review.updateMany(filter, update, { new: true });
};
