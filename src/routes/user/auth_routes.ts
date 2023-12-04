import express from "express";
import * as limiter from "../../utils/limiter";
import * as user_controllers from "../../controllers/user_controllers";
import * as authenticate from "../../middleware/authenticate";

const router: express.Router = express.Router();

interface IUserAuthRoutes {
  verifyEmail: "/verify-email";
  register: "/register";
  login: "/login";
  logout: "/logout";
  forgotPassword: "/forgot-password";
  resetPassword: "/reset-password";
  changePassword: "/change-password";
  refresh: "/refresh";
}

const user_auth_routes: IUserAuthRoutes = {
  verifyEmail: "/verify-email",
  register: "/register",
  login: "/login",
  logout: "/logout",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  changePassword: "/change-password",
  refresh: "/refresh",
};

// verify-email
router.post(
  user_auth_routes.verifyEmail,
  limiter.verifyEmailLimiter,
  user_controllers.verifyUserEmail
);

// register
router.post(user_auth_routes.register, user_controllers.postRegisterUser);

// login
router.post(user_auth_routes.login, user_controllers.postLoginUser);

// logout
router.post(
  user_auth_routes.logout,
  authenticate.authorizeUserSelf,
  user_controllers.postLogoutUser
);

// forgot-password
router.post(
  user_auth_routes.forgotPassword,
  limiter.forgotPasswordLimiter,
  user_controllers.postForgotPassword
);

// reset-password
router.patch(
  user_auth_routes.resetPassword,
  user_controllers.patchResetPassword
);

// change-password
router.patch(
  user_auth_routes.changePassword,
  user_controllers.patchChangePassword
);

// refresh
router.get(user_auth_routes.refresh, user_controllers.getNewRefreshToken);

export default router;
