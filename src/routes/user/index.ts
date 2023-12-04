import express from "express";
import * as authenticate from "../../middleware/authenticate";
import * as user_controllers from "../../controllers/user_controllers";

const router: express.Router = express.Router();

const user_route: "/u/:userId" = "/u/:userId";

// get users
router.get("/", authenticate.authorizeStaff, user_controllers.getUsers);

// user get, update, delete by id routes
router
  .route(user_route)
  .get(authenticate.authorizeUserSelfOrStaff, user_controllers.getUserById)
  .patch(
    authenticate.authorizeUserSelf,
    user_controllers.patchUserProfileImageById
  )
  .put(authenticate.authorizeUserSelf, user_controllers.putUserById)
  .delete(
    authenticate.authorizeUserSelfOrAdminStaff,
    user_controllers.deleteUserById
  );

export default router;
