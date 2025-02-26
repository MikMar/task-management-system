const authClient = require("../clients/authClient");

async function getUserEmail(userId) {
  return new Promise((resolve, reject) => {
    authClient.getUserInfo({ userId: userId }, (error, response) => {
      if (error) {
        if (error.message === "3 INVALID_ARGUMENT: Invalid userId provided") {
          return resolve(false);
        }
        return reject(new Error("Incorrect arguments passed"));
      }
      resolve(response.email);
    });
  });
}

module.exports = { getUserEmail };
