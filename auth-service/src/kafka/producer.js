const { Kafka } = require("kafkajs");

const kafka = new Kafka({ clientId: "auth-service", brokers: ["kafka:9093"] });
const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log("Kafka Producer Connected (Auth Service)");
}

// Publish user_deleted event
async function publishUserDeleted(userId) {
  try {
    await producer.send({
      topic: "user_deleted",
      messages: [{ value: JSON.stringify({ userId }) }],
    });
    console.log(`User deleted event published for userId: ${userId}`);
  } catch (error) {
    console.error("ailed to publish user_deleted event:", error);
  }
}

module.exports = { connectProducer, publishUserDeleted };
