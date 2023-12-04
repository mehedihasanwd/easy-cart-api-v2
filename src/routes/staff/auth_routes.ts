import express from "express";
import * as authenticate from "../../middleware/authenticate";
import * as staff_controllers from "../../controllers/staff_controllers";
import * as limiter from "../../utils/limiter";

interface IStaffAuthRoutes {
  verifyEmail: "/verify-email";
  register: "/register";
  login: "/login";
  logout: "/logout";
  forgotPassword: "/forgot-password";
  resetPassword: "/reset-password";
  changePassword: "/change-password";
  refresh: "/refresh";
}

const staff_auth_routes: IStaffAuthRoutes = {
  verifyEmail: "/verify-email",
  register: "/register",
  login: "/login",
  logout: "/logout",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  changePassword: "/change-password",
  refresh: "/refresh",
};

const router: express.Router = express.Router();

// verify-email
router.post(
  staff_auth_routes.verifyEmail,
  limiter.verifyEmailLimiter,
  staff_controllers.verifyStaffEmail
);

// register
router.post(staff_auth_routes.register, staff_controllers.postRegisterNewStaff);

// login
router.post(staff_auth_routes.login, staff_controllers.postLoginStaff);

// logout
router.post(
  staff_auth_routes.logout,
  authenticate.authorizeStaffSelfOrGuest,
  staff_controllers.postLogoutStaff
);

// forgot-password
router.post(
  staff_auth_routes.forgotPassword,
  limiter.forgotPasswordLimiter,
  staff_controllers.postForgotPassword
);

// reset-password
router.patch(
  staff_auth_routes.resetPassword,
  staff_controllers.patchResetPassword
);

// change-password
router.patch(
  staff_auth_routes.changePassword,
  authenticate.authorizeStaffSelf,
  staff_controllers.patchChangePassword
);

// refresh
router.get(staff_auth_routes.refresh, staff_controllers.getNewRefreshToken);

export default router;
