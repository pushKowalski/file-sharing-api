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
