import express from "express";
import * as product_controllers from "../controllers/product_controllers";
import * as authenticate from "../middleware/authenticate";

interface IProductRoutes {
  base_route: "/";
  route_param: "/p/:productId";
  get_product_status: "/status";
  get_product_discount: "/discount";
  get_product_stock: "/stock";
  get_product_slug: "/p/s/:slug";
  get_product_top_category: "/top-category";
  patch_product_discount: "/discount/p/:productId";
  patch_product_stock: "/stock/p/:productId";
  patch_product_image: "/image/p/:productId";
}

const product_routes: IProductRoutes = {
  base_route: "/",
  route_param: "/p/:productId",
  get_product_status: "/status",
  get_product_discount: "/discount",
  get_product_stock: "/stock",
  get_product_slug: "/p/s/:slug",
  get_product_top_category: "/top-category",
  patch_product_discount: "/discount/p/:productId",
  patch_product_stock: "/stock/p/:productId",
  patch_product_image: "/image/p/:productId",
};

const router: express.Router = express.Router();

//  get products, post new product
router
  .route(product_routes.base_route)
  .get(product_controllers.getProducts)
  .post(authenticate.authorizeAdminStaff, product_controllers.postNewProduct);

// get products by status
router.get(
  product_routes.get_product_status,
  authenticate.authorizeStaff,
  product_controllers.getProductsByStatus
);

// get products by discount
router.get(
  product_routes.get_product_discount,
  product_controllers.getProductsByDiscount
);

// get products by stock
router.get(
  product_routes.get_product_stock,
  product_controllers.getProductsByStock
);

// get products by top category
router.get(
  product_routes.get_product_top_category,
  product_controllers.getProductsByTopCategory
);

//  get product by slug
router.get(
  product_routes.get_product_slug,
  product_controllers.getProductBySlug
);

// patch product discount by id
router.patch(
  product_routes.patch_product_discount,
  authenticate.authorizeStaff,
  product_controllers.patchProductDiscountById
);

// patch product stock by id
router.patch(
  product_routes.patch_product_stock,
  authenticate.authorizeStaff,
  product_controllers.patchProductStockById
);

// patch product image by id
router.patch(
  product_routes.patch_product_image,
  authenticate.authorizeStaff,
  product_controllers.patchProductImageById
);

// product get, update, delete by id routes
router
  .route(product_routes.route_param)
  .get(product_controllers.getProductById)
  .patch(
    authenticate.authorizeStaff,
    product_controllers.patchProductStatusById
  )
  .put(authenticate.authorizeStaff, product_controllers.putProductById)
  .delete(
    authenticate.authorizeAdminStaff,
    product_controllers.deleteProductById
  );

export default router;
