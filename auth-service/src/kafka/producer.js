const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "auth-service",
  brokers: ["kafka:9093"],
});
const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log("Kafka Producer Connected (Auth Service)");
}

// Publish user_deleted event
async function publishUserDeleted(user) {
  try {
    await producer.send({
      topic: "user_deleted",
      messages: [{ value: JSON.stringify({ user }) }],
    });
    console.log(`User deleted event published for userId: ${user.id}`);
  } catch (error) {
    console.error("Failed to publish user_deleted event:", error);
  }
}

module.exports = { connectProducer, publishUserDeleted };
