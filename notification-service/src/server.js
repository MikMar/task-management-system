// notificationService.js

const express = require("express");
const { Kafka } = require("kafkajs");
const { getUserEmail } = require("./helpers/helper");
const sendEmail = require("./clients/emailClient");

const app = express();
const port = process.env.PORT || 3000;

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: ["kafka:9093"],
});

const consumer = kafka.consumer({ groupId: "notification-group" });

async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "notifications", fromBeginning: true });

  // Run the consumer to process each message
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = message.value.toString();
      console.log(`Received message on topic ${topic}: ${payload}`);

      try {
        const data = JSON.parse(payload);
        if (data.type === "task_created" && data.user_id) {
          const userEmail = await getUserEmail(data.user_id);

          if (userEmail && data.task_id) {
            await sendEmail(
              userEmail,
              "New Task Assigned",
              `<h2>A new task (ID: ${data.task_id}) has been assigned to you. Check your dashboard for details.</h2>`
            );
          } else {
            console.warn(`No email found for user ${data.user_id}`);
          }
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
}

// Start the Kafka consumer
runConsumer().catch(console.error);

app.listen(port, () => {
  console.log(`Notification service listening on port ${port}`);
});
