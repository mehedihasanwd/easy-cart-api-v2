import jwt from "jsonwebtoken";
import dotenvconfig from "../config/dotenvconfig";
import { RequestHandler } from "express";
import { IAuthPayload } from "../types/user_and_staff/payload_type";
import * as responses from "../utils/response";

interface IAuthUserRoles {
  admin: "admin";
  editor: "editor";
  user: "user";
}

const auth_user_roles: IAuthUserRoles = {
  admin: "admin",
  editor: "editor",
  user: "user",
};

declare global {
  namespace Express {
    interface Request {
      user?: IAuthPayload;
    }
  }
}

const authenticateToken: RequestHandler = async (req, res, next) => {
  const bearer_token: string = req.headers.authorization as string;

  if (!bearer_token) {
    return responses.responseErrorMessage(res, 401, {
      error: "Missing token! please try again using a valid token",
    });
  }

  try {
    const access_token: string = bearer_token.split(" ")[1];
    const decoded = jwt.verify(access_token, dotenvconfig.JWT_ACCESS);
    req.user = decoded as IAuthPayload;
    return next();
  } catch (e) {
    return responses.responseErrorMessage(res, 401, {
      error: "Invalid token or expired! please try again using a valid token",
    });
  }
};

export const authorizeUserSelf: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;
    const email_or_id_verification: boolean =
      user.email === req.body.email ||
      user._id === req.params.userId ||
      user._id === req.query.userId;

    if (user.role === auth_user_roles.user && email_or_id_verification) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeUserSelfOrStaff: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;
    const email_or_id_verification: boolean =
      user.email === req.body.email ||
      user._id === req.params.userId ||
      user._id === req.query?.userId;

    const staffs: string[] = [auth_user_roles.admin, auth_user_roles.editor];

    if (
      (user.role === auth_user_roles.user && email_or_id_verification) ||
      staffs.includes(user.role)
    ) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeStaffSelfOrGuest: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;
    const roles: string[] = [
      auth_user_roles.admin,
      auth_user_roles.editor,
      "guest",
    ];

    const email_or_id_verification: boolean =
      user.email === req.body.email || user._id === req.params.staffId;

    if (roles.includes(user.role) && email_or_id_verification) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeStaff: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;
    const roles: string[] = ["admin", "editor"];

    if (roles.includes(user.role)) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeAdminStaff: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;

    if (user.role === auth_user_roles.admin) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeStaffSelf: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;
    const roles: string[] = [auth_user_roles.admin, auth_user_roles.editor];
    const email_or_id_verification: boolean =
      user.email === req.body.email || user._id === req.params.staffId;

    if (roles.includes(user.role) && email_or_id_verification) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeUserOrStaff: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;
    const roles: string[] = [
      auth_user_roles.admin,
      auth_user_roles.editor,
      auth_user_roles.user,
    ];

    if (roles.includes(user.role)) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeUserSelfOrAdminStaff: RequestHandler = (
  req,
  res,
  next
) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;
    const email_or_id_verification: boolean =
      user.email === req.body.email || user._id === req.params.userId;

    if (
      (user.role === auth_user_roles.user && email_or_id_verification) ||
      user.role === auth_user_roles.admin
    ) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeSuperAdminOrStaffSelf: RequestHandler = (
  req,
  res,
  next
) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const roles: string[] = ["admin", "editor"];
    const user: IAuthPayload = req.user;

    const email_or_id_verification: boolean =
      user.email === req.body.email || user._id === req.params.staffId;

    if (
      (roles.includes(user.role) && email_or_id_verification) ||
      (user.role === auth_user_roles.admin &&
        user.email === dotenvconfig.SUPER_ADMIN)
    ) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};

export const authorizeSuperAdmin: RequestHandler = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user) return;

    const user: IAuthPayload = req.user;

    if (
      user.role === auth_user_roles.admin &&
      user.email === dotenvconfig.SUPER_ADMIN
    ) {
      return next();
    } else {
      return responses.responseErrorMessage(res, 403, {
        error: "Permission denied!",
      });
    }
  });
};
