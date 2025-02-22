const grpc = require("@grpc/grpc-js");
const { ZodError } = require("zod");
const authClient = require("../clients/authClient");

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

async function checkUserExists(userId) {
  return new Promise((resolve, reject) => {
    authClient.UserExists({ userId: userId }, (error, response) => {
      if (error) {
        if (error.message === "3 INVALID_ARGUMENT: Invalid userId provided") {
          return resolve(false);
        }
        return reject(new Error("Incorrect arguments passed"));
      }
      resolve(response.exists);
    });
  });
}

module.exports = { handleGrpcCall, checkUserExists };
