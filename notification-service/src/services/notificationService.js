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
    // If we reduce the timeout to lets say 100ms, the circuit breaker will open.
    // But the request to send the email was already sent, so the email will be most probalby sent.
    // The circuit braker will throw an error and thus the message for the email will be recreated.
    // All the other emails comming after the circuit is open will not be sent.
    // So for first email it would be endless loop of sending the same email.
    // Implementing breaker in this scenario with small timeout is not a good idea and was made only for the learning purposes.
    // From the other hand if we really got an error from the email service, in that case we need to recreate the message.
    // And for that circuit breaker is a good solution, it will stop next kafka messages from overloading the email service.
    // Also due to factor and multiplier options in Kafka it would not attack the email service with all the messages at once.
    return await emailCircuit.fire(to, subject, text);
  } catch (error) {
    console.error("Email failed, circuit breaker activated:", error.message);

    throw error; // Rethrow the error to trigger a retry from Kafka
  }
}

module.exports = { safeSendEmail };
