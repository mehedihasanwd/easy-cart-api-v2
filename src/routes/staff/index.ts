import express from "express";
import * as authenticate from "../../middleware/authenticate";
import * as staff_controllers from "../../controllers/staff_controllers";

const router: express.Router = express.Router();

const staff_route: "/a/:staffId" = "/a/:staffId";
const staff_role_update_route: "/a/role/:staffId" = "/a/role/:staffId";

// get all staffs
router.get("/", authenticate.authorizeStaff, staff_controllers.getStaffs);

// staff get, update, delete by id routes
router
  .route(staff_route)
  .get(authenticate.authorizeStaff, staff_controllers.getStaffById)
  .patch(
    authenticate.authorizeStaffSelf,
    staff_controllers.patchStaffProfileImageById
  )
  .put(authenticate.authorizeStaffSelf, staff_controllers.putStaffById)
  .delete(
    authenticate.authorizeSuperAdminOrStaffSelf,
    staff_controllers.deleteStaffById
  );

// update staff role by id
router.patch(
  staff_role_update_route,
  authenticate.authorizeSuperAdmin,
  staff_controllers.patchStaffRoleById
);

export default router;
