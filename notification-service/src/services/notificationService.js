const CircuitBreaker = require("opossum");
const sendEmail = require("../clients/emailClient");

const emailCircuit = new CircuitBreaker(sendEmail, {
  timeout: 5000, // If request takes longer than 5s, consider it failed
  errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
  resetTimeout: 10000, // Try again after 10 seconds if the circuit is open
});

emailCircuit.on("open", () =>
  console.warn("Circuit breaker OPEN - stopping email sending")
);
emailCircuit.on("halfOpen", () =>
  console.log("Circuit breaker HALF-OPEN - testing requests")
);
emailCircuit.on("close", () =>
  console.log("Circuit breaker CLOSED - email sending restored")
);

async function safeSendEmail(to, subject, text) {
  try {
    return await emailCircuit.fire(to, subject, text);
  } catch (error) {
    console.error("Email failed, circuit breaker activated:", error.message);
  }
}

module.exports = { safeSendEmail };
