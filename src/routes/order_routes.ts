import express from "express";
import * as authenticate from "../middleware/authenticate";
import * as order_controllers from "../controllers/order_controllers";

const router: express.Router = express.Router();

interface IOrderRoutes {
  base_path: "/";
  order_by_id: "/o/:orderId";
  orders_by_user_id: "/u/:userId";
  orders_by_product_id: "/p/:productId";
  ordered_products: "/products";
  ordered_products_by_product_id: "/products/p/:productId";
  ordered_products_by_order_id: "/o/:orderId/products";
  ordered_products_by_user_id: "/products/u/:userId";
}

const order_routes: IOrderRoutes = {
  base_path: "/",
  order_by_id: "/o/:orderId",
  orders_by_user_id: "/u/:userId",
  orders_by_product_id: "/p/:productId",
  ordered_products: "/products",
  ordered_products_by_product_id: "/products/p/:productId",
  ordered_products_by_order_id: "/o/:orderId/products",
  ordered_products_by_user_id: "/products/u/:userId",
};

// get orders, post new order
router
  .route(order_routes.base_path)
  .get(authenticate.authorizeStaff, order_controllers.getOrders)
  .post(authenticate.authorizeUserSelf, order_controllers.postNewOrder);

// get ordered products
router.get(
  order_routes.ordered_products,
  authenticate.authorizeStaff,
  order_controllers.getOrderedProducts
);

// order get, update, delete by id routes
router
  .route(order_routes.order_by_id)
  .get(authenticate.authorizeUserSelfOrStaff, order_controllers.getOrderById)
  .patch(authenticate.authorizeStaff, order_controllers.patchOrderStatusById)
  .delete(authenticate.authorizeAdminStaff, order_controllers.deleteOrderById);

// get orders by user id
router.get(
  order_routes.orders_by_user_id,
  authenticate.authorizeUserSelfOrStaff,
  order_controllers.getOrdersByUserId
);

// get orders by product id
router.get(
  order_routes.orders_by_product_id,
  authenticate.authorizeStaff,
  order_controllers.getOrdersByProductId
);

// get ordered products by product id
router.get(
  order_routes.ordered_products_by_product_id,
  authenticate.authorizeStaff,
  order_controllers.getOrderedProductsByProductId
);

// get ordered products by user id
router.get(
  order_routes.ordered_products_by_user_id,
  authenticate.authorizeUserSelfOrStaff,
  order_controllers.getOrderedProductsByUserId
);

// get ordered products by order id
router.get(
  order_routes.ordered_products_by_order_id,
  authenticate.authorizeUserSelfOrStaff,
  order_controllers.getOrderedProductsByOrderId
);

export default router;
