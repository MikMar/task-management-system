const errorHandlerMiddleware = (err, req, res, next) => {
  res.status(err.status || 500);
  res.setHeader("Content-Type", "application/json");
  res.json({
    error: {
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
};

module.exports = errorHandlerMiddleware;
