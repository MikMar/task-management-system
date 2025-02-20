const grpc = require("@grpc/grpc-js");
const { ZodError } = require("zod");

async function handleGrpcCall(call, callback, handler) {
  try {
    const result = await handler(call.request);
    callback(null, result);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );

      const errorDetails = "Validation error(s): " + formattedErrors.join("; ");

      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        details: errorDetails,
      });
    }

    if (error.code === "P2025") {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }

    return callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

module.exports = { handleGrpcCall };
