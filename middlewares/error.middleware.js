export const notFoundError = (req, res) => {
  return res.status(404).json({
    success: false,
    error: "Route not found",
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error("Error⛔⛔", err);

  const statusCode = err.statusCode || 500;
  const errorResponse =
    err.validationErrors || err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
};
