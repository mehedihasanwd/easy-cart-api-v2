import express from "express";
import * as responses from "../utils/response";
import staff_auth_routes from "./staff/auth_routes";
import user_auth_routes from "./user/auth_routes";
import user_routes from "./user";
import staff_routes from "./staff";
import category_routes from "./category_routes";
import product_routes from "./product_routes";
import order_routes from "./order_routes";
import review_routes from "./review_routes";

const router: express.Router = express.Router();

interface IRoutes {
  health_path: "/api/v1/health";
  staffs_auth_path: "/api/v1/auth/staffs";
  users_auth_path: "/api/v1/auth/users";
  staffs_path: "/api/v1/staffs";
  users_path: "/api/v1/users";
  categories_path: "/api/v1/categories";
  products_path: "/api/v1/products";
  orders_path: "/api/v1/orders";
  reviews_path: "/api/v1/reviews";
}

const routes_path: IRoutes = {
  health_path: "/api/v1/health",
  staffs_auth_path: "/api/v1/auth/staffs",
  users_auth_path: "/api/v1/auth/users",
  staffs_path: "/api/v1/staffs",
  users_path: "/api/v1/users",
  categories_path: "/api/v1/categories",
  products_path: "/api/v1/products",
  orders_path: "/api/v1/orders",
  reviews_path: "/api/v1/reviews",
};

const getHealth: express.RequestHandler = (
  req,
  res,
  next
): express.Response => {
  return responses.responseSuccessMessage(res, 200, { message: "Success" });
};

// get health
router.get(routes_path.health_path, getHealth);

router.use(routes_path.staffs_auth_path, staff_auth_routes);
router.use(routes_path.users_auth_path, user_auth_routes);
router.use(routes_path.staffs_path, staff_routes);
router.use(routes_path.users_path, user_routes);
router.use(routes_path.categories_path, category_routes);
router.use(routes_path.products_path, product_routes);
router.use(routes_path.orders_path, order_routes);
router.use(routes_path.reviews_path, review_routes);

export default router;
