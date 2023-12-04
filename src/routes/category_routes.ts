import express from "express";
import * as authenticate from "../middleware/authenticate";
import * as category_controllers from "../controllers/category_controllers";

interface ICategoryRoutes {
  base_route: "/";
  route_param: "/c/:categoryId";
  route_image: "/c/image/:categoryId";
}

const category_routes: ICategoryRoutes = {
  base_route: "/",
  route_param: "/c/:categoryId",
  route_image: "/c/image/:categoryId",
};

const router: express.Router = express.Router();

// add category, get categories
router
  .route(category_routes.base_route)
  .get(authenticate.authorizeStaff, category_controllers.getCategories)
  .post(authenticate.authorizeAdminStaff, category_controllers.postNewCategory);

// category get, update, delete by id routes
router
  .route(category_routes.route_param)
  .get(authenticate.authorizeStaff, category_controllers.getCategoryById)
  .patch(
    authenticate.authorizeAdminStaff,
    category_controllers.patchCategoryStatusById
  )
  .put(authenticate.authorizeAdminStaff, category_controllers.putCategoryById)
  .delete(
    authenticate.authorizeAdminStaff,
    category_controllers.deleteCategoryById
  );

// patch category image
router.patch(
  category_routes.route_image,
  authenticate.authorizeAdminStaff,
  category_controllers.patchCategoryImageById
);

export default router;
