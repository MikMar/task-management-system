// producer.js
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "task-service",
  brokers: ["kafka:9093"],
});

const producer = kafka.producer();

// Connect the producer
async function connectProducer() {
  await producer.connect();
  console.log("Kafka Producer connected");
}

async function sendTaskCreatedMessage(userId, taskId) {
  try {
    const messagePayload = {
      type: "task_created",
      user_id: String(userId),
      task_id: String(taskId),
    };
    await producer.send({
      topic: "notifications",
      messages: [{ value: JSON.stringify(messagePayload) }],
    });
    console.log(
      "Sent task_created message for user:",
      userId,
      "with task ID:",
      taskId
    );
  } catch (err) {
    console.error("Error sending message", err);
  }
}

async function publishCompensationEvent(user) {
  try {
    await producer.send({
      topic: "compensate_user_deletion",
      messages: [{ value: JSON.stringify({ user }) }],
    });
    console.log(`Compensation event published for userId: ${user.id}`);
  } catch (error) {
    console.error("Failed to publish compensation event:", error);
  }
}

module.exports = {
  connectProducer,
  sendTaskCreatedMessage,
  publishCompensationEvent,
};
