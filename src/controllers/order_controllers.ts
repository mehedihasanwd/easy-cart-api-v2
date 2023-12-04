import { THydratedUserDocument } from "./../types/user/user_document_type";
import { errorReducer } from "./../utils/error_reducer";
import { isValidParamsId } from "./../utils/is_valid_params_id";
import { RequestHandler } from "express";
import { THydratedOrderDocument } from "../types/order/order_document_type";
import * as responses from "../utils/response";
import * as order_request_data_validators from "../validators/order_controllers_request_data_validator";
import * as user_services from "../services/user_services";
import * as product_services from "../services/product_services";
import * as order_services from "../services/order_services";
import * as order_controllers_type from "../types/order/order_controllers_services_type";
import { THydratedProductDocument } from "../types/product/product_document_type";

export const postNewOrder: RequestHandler = async (req, res, next) => {
  const { value, error } =
    order_request_data_validators.post_new_order_validate_schema.validate(
      {
        user_id: req.body?.user_id,
        shipping_address: req.body?.shipping_address,
        products: req.body?.products,
      },
      { abortEarly: false }
    );

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  if (!isValidParamsId({ _id: value.user_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "_id", value: value.user_id });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    let is_product_error: boolean = false;

    value.products.map(
      async (product: order_controllers_type.IPostOrderProduct) => {
        if (!isValidParamsId({ _id: product.product_id })) {
          return (is_product_error = true);
        }

        const found_product: THydratedProductDocument | null =
          await product_services.findProductByProp({
            key: "_id",
            value: product.product_id.toString(),
          });

        if (!found_product) {
          return (is_product_error = true);
        }

        return product;
      }
    );

    if (is_product_error) {
      return responses.responseErrorMessage(res, 404, {
        error: "Your order contains an invalid product! cannot place order",
      });
    }

    const new_order: THydratedOrderDocument | null =
      await order_services.createNewOrder({
        data: {
          user_id: value.user_id,
          products: value.products.map(
            (product: order_controllers_type.IPostOrderProduct) => {
              return {
                ...product,
                user_id: value.user_id,
              };
            }
          ),
          shipping_address: value.shipping_address,
        },
      });

    if (!new_order) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    return responses.responseSuccessData(res, 201, {
      message: "Placed order successfully",
      order: new_order,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrders: RequestHandler = async (req, res, next) => {
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const orders: Array<THydratedOrderDocument> | null =
      await order_services.findOrdersByProp({
        key: "all",
        value: "all",
        skip,
        limit,
      });

    if (!orders) {
      return responses.responseErrorMessage(res, 404, {
        error: "orders not found",
      });
    }

    const total_orders: number = await order_services.countOrdersByProp({
      key: "all",
      value: "all",
    });

    const total_pages: number = Math.ceil(total_orders / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      orders,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrdersByUserId: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.userId;
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  try {
    const user: THydratedUserDocument | null =
      await user_services.findUserByProp({ key: "_id", value: _id });

    if (!user) {
      return responses.responseErrorMessage(res, 404, {
        error: "User not found!",
      });
    }

    const user_orders: Array<THydratedOrderDocument> | null =
      await order_services.findOrdersByProp({
        key: "user_id",
        value: _id,
        skip,
        limit,
      });

    if (!user_orders) {
      return responses.responseErrorMessage(res, 404, {
        error: "No orders found!",
      });
    }

    const total_orders: number = await order_services.countOrdersByProp({
      key: "user_id",
      value: _id,
    });

    const total_pages: number = Math.ceil(total_orders / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      orders: user_orders,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrdersByProductId: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.productId;

  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  try {
    const orders: Array<THydratedOrderDocument> | null =
      await order_services.findOrdersByProp({
        key: "product_id",
        value: _id,
        skip,
        limit,
      });

    if (!orders) {
      return responses.responseErrorMessage(res, 404, {
        error: "No orders found!",
      });
    }

    const total_orders: number = await order_services.countOrdersByProp({
      key: "product_id",
      value: _id,
    });

    const total_pages: number = Math.ceil(total_orders / limit);
    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      orders,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrderedProducts: RequestHandler = async (req, res, next) => {
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  try {
    const ordered_products: Array<order_controllers_type.IOrderedProductDataService> | null =
      await order_services.findOrderedProductsByProp({
        key: "all",
        value: "all",
        skip,
        limit,
      });

    if (!ordered_products) {
      return responses.responseErrorMessage(res, 404, {
        error: "No products found!",
      });
    }

    const total_products: number =
      await order_services.countOrderedProductsByProp({
        key: "all",
        value: "all",
      });

    const total_pages: number = Math.ceil(total_products / limit);

    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      products: ordered_products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrderedProductsByUserId: RequestHandler = async (
  req,
  res,
  next
) => {
  const user_id: string = req.params?.userId as string;
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  if (!isValidParamsId({ _id: user_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid user id! please try again using a valid one",
    });
  }

  try {
    const ordered_products: Array<order_controllers_type.IOrderedProductDataService> | null =
      await order_services.findOrderedProductsByProp({
        key: "user_id",
        value: user_id,
        skip,
        limit,
      });

    if (!ordered_products) {
      return responses.responseErrorMessage(res, 404, {
        error: "No products found!",
      });
    }

    const total_products: number =
      await order_services.countOrderedProductsByProp({
        key: "user_id",
        value: user_id,
      });

    const total_pages: number = Math.ceil(total_products / limit);

    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      products: ordered_products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrderedProductsByProductId: RequestHandler = async (
  req,
  res,
  next
) => {
  const product_id: string = req.params?.productId as string;
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  if (!isValidParamsId({ _id: product_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid product id! please try again using a valid one",
    });
  }

  try {
    const ordered_products: Array<order_controllers_type.IOrderedProductDataService> | null =
      await order_services.findOrderedProductsByProp({
        key: "product_id",
        value: product_id,
        skip,
        limit,
      });

    if (!ordered_products) {
      return responses.responseErrorMessage(res, 404, {
        error: "No products found!",
      });
    }

    const total_products: number =
      await order_services.countOrderedProductsByProp({
        key: "product_id",
        value: product_id,
      });

    const total_pages: number = Math.ceil(total_products / limit);

    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      products: ordered_products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrderedProductsByOrderId: RequestHandler = async (
  req,
  res,
  next
) => {
  const order_id: string = req.params?.orderId as string;
  const current_page: number = Number(req.query?.page || "1");
  const limit: number = Number(req.query?.limit || "8");
  const skip: number = (current_page - 1) * limit;
  const prev_page: number | null = current_page > 1 ? current_page - 1 : null;

  if (!isValidParamsId({ _id: order_id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid order id! please try again using a valid one",
    });
  }

  try {
    const ordered_products: Array<order_controllers_type.IOrderedProductDataService> | null =
      await order_services.findOrderedProductsByProp({
        key: "order_id",
        value: order_id,
        skip,
        limit,
      });

    if (!ordered_products) {
      return responses.responseErrorMessage(res, 404, {
        error: "No products found!",
      });
    }

    const total_products: number =
      await order_services.countOrderedProductsByProp({
        key: "order_id",
        value: order_id,
      });

    const total_pages: number = Math.ceil(total_products / limit);

    const next_page: number | null =
      current_page < total_pages ? current_page + 1 : null;

    return responses.responseSuccessData(res, 200, {
      current_page,
      prev_page,
      next_page,
      total_pages,
      products: ordered_products,
    });
  } catch (e) {
    return next(e);
  }
};

export const getOrderById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.orderId;

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid order id! please try again using a valid one",
    });
  }

  try {
    const order: THydratedOrderDocument | null =
      await order_services.findOrderByProp({ key: "_id", value: _id });

    if (!order) {
      return responses.responseErrorMessage(res, 404, {
        error: "Order not found!",
      });
    }

    return responses.responseSuccessData(res, 200, { order: order.toJSON() });
  } catch (e) {
    return next(e);
  }
};

export const patchOrderStatusById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.orderId;
  const { value, error } =
    order_request_data_validators.patch_order_status_validate_schema.validate({
      status: req.body?.status,
    });

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid order id! please try again using a valid one",
    });
  }

  if (error) {
    return responses.responseErrorMessages(res, 400, {
      errors: errorReducer(error.details),
    });
  }

  try {
    const order: THydratedOrderDocument | null =
      await order_services.findOrderByProp({ key: "_id", value: _id });

    if (!order) {
      return responses.responseErrorMessage(res, 404, {
        error: "Order not found!",
      });
    }

    if (order.status === value.status) {
      return responses.responseErrorMessage(res, 400, {
        error: `Order status is already ${value.status}`,
      });
    }

    const updated_order: THydratedOrderDocument | null =
      await order_services.updateOrderStatusById({ _id, status: value.status });

    if (!updated_order) {
      return responses.responseErrorMessage(res, 500, {
        error: "Server error occurred! please try again",
      });
    }

    return responses.responseSuccessData(res, 200, {
      message: `Order is ${updated_order.status}`,
      order: updated_order.toJSON(),
    });
  } catch (e) {
    return next(e);
  }
};

export const deleteOrderById: RequestHandler = async (req, res, next) => {
  const _id: string = req.params?.orderId;

  const order_statuses: string[] = ["pending", "processing", "shipped"];

  if (!isValidParamsId({ _id })) {
    return responses.responseErrorMessage(res, 400, {
      error: "Invalid order id! please try again using a valid one",
    });
  }

  try {
    const order: THydratedOrderDocument | null =
      await order_services.findOrderByProp({ key: "_id", value: _id });

    if (!order) {
      return responses.responseErrorMessage(res, 404, {
        error: "Order not found!",
      });
    }

    if (order_statuses.includes(order.status)) {
      return responses.responseErrorMessage(res, 400, {
        error: `Order with status '${order.status}' can not be deleted!`,
      });
    }

    await order_services.removeOrderById({ _id });
    return responses.responseSuccessMessage(res, 200, {
      message: "Order deleted successfully",
    });
  } catch (e) {
    return next(e);
  }
};
