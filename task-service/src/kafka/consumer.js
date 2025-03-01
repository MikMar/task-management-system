const { Kafka } = require("kafkajs");
const { PrismaClient } = require("@prisma/client");
const { publishCompensationEvent } = require("./producer");

const kafka = new Kafka({ clientId: "task-service", brokers: ["kafka:9093"] });
const consumer = kafka.consumer({ groupId: "task-group" });
const prisma = new PrismaClient();

async function connectConsumer() {
  await consumer.connect();
  console.log("Kafka Consumer Connected (Task Service)");

  await consumer.subscribe({ topic: "user_deleted", fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { userId } = JSON.parse(message.value);
      console.log(`Received user_deleted event for userId: ${userId}`);

      try {
        // Unassign tasks from deleted user
        const updateResult = await prisma.task.updateMany({
          where: { assignedTo: userId },
          data: { assignedTo: null },
        });

        if (updateResult.count === 0) {
          console.warn(`No tasks were found for user ${userId}`);
        } else {
          console.log(`Tasks unassigned for deleted user ${userId}`);
        }
      } catch (error) {
        console.error("Failed to update tasks:", error);

        // Publish compensation event to restore user in Auth Service
        //await publishCompensationEvent(userId);
      }
    },
  });
}

module.exports = { connectConsumer };
