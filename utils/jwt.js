import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
};
