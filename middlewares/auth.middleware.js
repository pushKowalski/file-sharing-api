import { verifyToken } from "../utils/jwt.js";

export const requireLogin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("You are not logged in");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    if (!decoded) {
      const error = new Error("Invalid or expired token");
      error.statusCode = 401;
      throw error;
    }

    req.user = decoded;

    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      const message = `You are not authorised. Only ${roles.join(
        " or "
      )} can access this resource`;
      const err = new Error(message);
      err.statusCode = 403;
      return next(err);
    }

    next();
  };
};
