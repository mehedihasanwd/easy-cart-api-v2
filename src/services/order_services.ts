import Stripe from "stripe";
import dotenvconfig from "../config/dotenvconfig";
import {
  THydratedOrderDocument,
  TRemovedOrderDocument,
} from "./../types/order/order_document_type";
import { createUniqueId } from "../utils/create_unique_id";
import { Order } from "../models/Order";
import * as product_services from "./product_services";
import * as common_type from "../types/common_type";
import * as order_services_type from "../types/order/order_controllers_services_type";

// helpers
const configureOrdersPipeline = ({ value }: common_type.IValue) => {
  const orders_by_user_id_pipeline_config = [
    {
      $match: {
        user_id: value,
      },
    },
  ];

  const orders_by_product_id_pipeline_config = [
    {
      $unwind: "$products",
    },

    {
      $match: {
        "products.product_id": value,
      },
    },
  ];

  return {
    orders_by_product_id_pipeline_config,
    orders_by_user_id_pipeline_config,
  };
};

const configureOrderedProductsPipeline = ({ value }: common_type.IValue) => {
  const order_id_pipeline_config = [
    {
      $match: { $expr: { $eq: ["$_id", { $toObjectId: value }] } },
    },

    {
      $unwind: "$products",
    },

    { $replaceRoot: { newRoot: "$products" } },
  ];

  const user_id_pipeline_config = [
    { $match: { user_id: value } },

    { $unwind: "$products" },

    { $replaceRoot: { newRoot: "$products" } },
  ];

  const product_id_pipeline_config = [
    { $unwind: "$products" },

    { $match: { "products.product_id": value } },

    { $replaceRoot: { newRoot: "$products" } },
  ];

  const all_ordered_products_pipeline_config = [
    { $unwind: "$products" },
    { $replaceRoot: { newRoot: "$products" } },
  ];

  return {
    order_id_pipeline_config,
    user_id_pipeline_config,
    product_id_pipeline_config,
    all_ordered_products_pipeline_config,
  };
};

const stripePayment = async ({
  total_cost,
}: {
  total_cost: number;
}): Promise<order_services_type.TStripePaymentIntent> => {
  const stripe: Stripe = new Stripe(dotenvconfig.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });

  const payment_intent: order_services_type.TStripePaymentIntent =
    await stripe.paymentIntents.create({
      amount: total_cost * 100,
      currency: "usd",
      payment_method_types: ["card"],
    });

  return payment_intent;
};

// services
export const findOrderByProp = async ({
  key,
  value,
}: order_services_type.IFindOrderByPropServiceParam): Promise<THydratedOrderDocument | null> => {
  if (key === "_id") {
    return await Order.findById(value);
  }

  return await Order.findOne({ [key]: value });
};

export const createNewOrder = async ({
  data,
}: order_services_type.ICreateNewOrderServiceParam): Promise<THydratedOrderDocument | null> => {
  const total_cost: number = data.products.reduce(
    (acc: number, cur: order_services_type.IPostOrderProduct) =>
      acc + cur.price * cur.quantity,
    0
  );

  const payment_intent: order_services_type.TStripePaymentIntent =
    await stripePayment({ total_cost });

  const new_order: THydratedOrderDocument | null = new Order({
    ...data,
    products: data.products,
    total_cost,
    payment_intent: payment_intent.id,
    client_secret: payment_intent.client_secret,
    shipping_address: {
      country: data.shipping_address.country,
      city: data.shipping_address.city,
      house_number_or_name: data.shipping_address.house_number_or_name,
      post_code: data.shipping_address.post_code,
      phone: data.shipping_address.phone,
    },
  });

  if (!new_order) {
    return null;
  }

  new_order.products.map(
    (product: order_services_type.IPlacedNewOrderProduct) => {
      product.order_id = new_order._id as string;
      product.product_uid = createUniqueId() as string;
      return {
        ...product,
      };
    }
  );

  new_order.save();

  new_order.products.map(
    async (product: order_services_type.IPlacedNewOrderProduct) => {
      await product_services.updateProductSalesAndStockById({
        _id: product.product_id,
        sales: product.quantity,
      });
    }
  );

  return new_order;
};

export const findOrdersByProp = async ({
  key,
  value,
  skip,
  limit,
}: order_services_type.IFindOrdersByPropServiceParam): Promise<Array<THydratedOrderDocument> | null> => {
  let orders: Array<THydratedOrderDocument> | null = null;

  if (key === "all") {
    orders = await Order.aggregate(
      skip && limit
        ? [
            {
              $skip: skip,
            },

            { $limit: limit },

            { $sort: { _id: -1 } },
          ]
        : [{ $sort: { _id: -1 } }]
    );
  }

  if (key === "user_id") {
    const { orders_by_user_id_pipeline_config } = configureOrdersPipeline({
      value,
    });

    orders = await Order.aggregate(
      skip && limit
        ? [
            ...orders_by_user_id_pipeline_config,

            {
              $skip: skip,
            },

            { $limit: limit },

            { $sort: { _id: -1 } },
          ]
        : [{ $sort: { _id: -1 } }]
    );
  }

  if (key === "product_id") {
    const { orders_by_product_id_pipeline_config } = configureOrdersPipeline({
      value,
    });

    orders = await Order.aggregate(
      skip && limit
        ? [
            ...orders_by_product_id_pipeline_config,

            {
              $skip: skip,
            },

            { $limit: limit },

            { $sort: { _id: -1 } },
          ]
        : [{ $sort: { _id: -1 } }]
    );
  }

  if (!orders || orders.length === 0) return null;

  return orders;
};

export const findOrderedProductsByProp = async ({
  key,
  value,
  skip,
  limit,
}: order_services_type.IFindOrderedProductsByPropServiceParam): Promise<Array<order_services_type.IOrderedProductDataService> | null> => {
  let ordered_products: Array<order_services_type.IOrderedProductDataService> | null =
    null;

  if (key === "order_id") {
    const { order_id_pipeline_config } = configureOrderedProductsPipeline({
      value,
    });

    ordered_products = await Order.aggregate(
      skip && limit
        ? [
            ...order_id_pipeline_config,
            { $skip: skip },
            { $limit: limit },
            { $sort: { _id: -1 } },
          ]
        : [...order_id_pipeline_config, { $sort: { _id: -1 } }]
    );
  }

  if (key === "user_id") {
    const { user_id_pipeline_config } = configureOrderedProductsPipeline({
      value,
    });

    ordered_products = await Order.aggregate(
      skip && limit
        ? [
            ...user_id_pipeline_config,
            { $skip: skip },
            { $limit: limit },
            { $sort: { _id: -1 } },
          ]
        : [...user_id_pipeline_config, { $sort: { _id: -1 } }]
    );
  }

  if (key === "product_id") {
    const { product_id_pipeline_config } = configureOrderedProductsPipeline({
      value,
    });

    ordered_products = await Order.aggregate(
      skip && limit
        ? [
            ...product_id_pipeline_config,
            { $skip: skip },
            { $limit: limit },
            { $sort: { _id: -1 } },
          ]
        : [...product_id_pipeline_config, { $sort: { _id: -1 } }]
    );
  }

  if (key === "all") {
    const { all_ordered_products_pipeline_config } =
      configureOrderedProductsPipeline({
        value,
      });

    ordered_products = await Order.aggregate(
      skip && limit
        ? [
            ...all_ordered_products_pipeline_config,
            { $skip: skip },
            { $limit: limit },
            { $sort: { _id: -1 } },
          ]
        : [...all_ordered_products_pipeline_config, { $sort: { _id: -1 } }]
    );
  }

  if (!ordered_products || ordered_products.length === 0) return null;

  return ordered_products;
};

export const countOrdersByProp = async ({
  key,
  value,
}: order_services_type.ICountOrdersByPropServiceParam): Promise<number> => {
  const order_status_value: string[] = [
    "pending",
    "processing",
    "shipped",
    "completed",
  ];

  if (key === "user_id") {
    return await Order.countDocuments({ user_id: value });
  }

  if (key === "product_id") {
    const orders: Array<{ count: number }> = await Order.aggregate([
      { $unwind: "$products" },
      {
        $match: {
          "products.product_id": value,
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    return orders[0].count > 0 ? orders[0].count : 0;
  }

  if (key === "status" && order_status_value.includes(value)) {
    return await Order.countDocuments({ status: { $eq: value } });
  }

  return await Order.countDocuments({});
};

export const countOrderedProductsByProp = async ({
  key,
  value,
}: order_services_type.ICountOrderedProductsByPropServiceParam): Promise<number> => {
  let ordered_products: { count: number }[] = [];

  const unwind_replace_root_group_stage = [
    { $unwind: "$products" },
    { $replaceRoot: { newRoot: "$products" } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
  ];

  if (key === "all") {
    ordered_products = await Order.aggregate([
      ...unwind_replace_root_group_stage,
    ]);
  }

  if (key === "order_id") {
    ordered_products = await Order.aggregate([
      {
        $match: {
          $expr: { $eq: ["$_id", { $toObjectId: value }] },
        },
      },
      ...unwind_replace_root_group_stage,
    ]);
  }

  if (key === "user_id") {
    ordered_products = await Order.aggregate([
      {
        $match: {
          user_id: value,
        },
      },
      ...unwind_replace_root_group_stage,
    ]);
  }

  if (key === "product_id") {
    ordered_products = await Order.aggregate([
      { $unwind: "$products" },

      {
        $match: {
          "products.product_id": value,
        },
      },

      { $replaceRoot: { newRoot: "$producst" } },

      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);
  }

  if (!ordered_products || ordered_products.length === 0) return 0;

  return ordered_products[0].count;
};

export const updateOrderedProductImageById = async ({
  product_id,
  image,
}: order_services_type.IUpdateOrderedProductImageByIdServiceParam): Promise<void> => {
  const filter = { "products.product_id": product_id };

  const update = {
    $set: {
      "products.$[elem].image.key": image.key,
      "products.$[elem].image.url": image.url,
    },
  };

  const options = {
    arrayFilters: [{ "elem.product_id": product_id }],
  };

  await Order.updateMany(filter, update, { ...options, new: true });
};

export const updateOrderStatusById = async ({
  _id,
  status,
}: order_services_type.IUpdateOrderStatusByIdServiceParam): Promise<THydratedOrderDocument | null> => {
  const updated_order: THydratedOrderDocument | null =
    await Order.findByIdAndUpdate(
      _id,
      {
        $set: { status },
      },
      { new: true }
    );

  if (!updated_order) return null;

  return updated_order.save();
};

export const removeOrderById = async ({
  _id,
}: common_type.IDocumentId): Promise<TRemovedOrderDocument> => {
  return await Order.findByIdAndDelete(_id);
};
