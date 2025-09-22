import { decodeToken } from '../utility/jwt.js';
import User from '../models/users.js'; 

export const ensureAuth = (...userType) => {
  return async function (req, res, next) {
    if (!req.headers.authorization && userType.includes("Guest")) {
      return next();
    }

    if (!req.headers.authorization) {
      return res.status(403).send({
        status: "error",
        message: "Not authorized",
      });
    }

    const token = req.headers.authorization.replace(/^Bearer\s+/, "");
    let payload;

    try {
      payload = decodeToken(token);
      if (payload.expiresIn < Math.floor(Date.now() / 1000)) {
        return res.status(401).send({
          status: "error",
          message: "Token expired",
        });
      }
    } catch (err) {
      return res.status(401).send({
        status: "error",
        message: "Invalid token",
      });
    }

    try {
      const user = await User.findById(payload.id).lean();

      if (!user) {
        return res.status(404).send({
          status: "error",
          message: "User not found",
        });
      }

      req.permission = {};
      req.user = payload;
      req.user.role = user.role;

      if (user.role === 'Admin' || userType.includes(user.role) || userType.includes('Guest')) {
        req.user.hasAccess = () => true; 
        req.permission.global = user.role === 'Admin';
        return next();
      }

      return res.status(403).send({
        status: "error",
        message: "Not authorized",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        status: "error",
        message: "Server error",
      });
    }
  };
};

export const setModule = (module) => {
  return function (req, res, next) {
    req.module = module;

    switch (req.method) {
      case "GET":
        req.permission = { module: module + "-read" };
        break;
      case "POST":
      case "PUT":
        req.permission = { module: module + "-write" };
        break;
      case "PATCH":
      case "DELETE":
        req.permission = { module: module + "-all" };
        break;
    }
    next();
  };
};
