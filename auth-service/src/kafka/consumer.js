const { Kafka } = require("kafkajs");
const { PrismaClient } = require("@prisma/client");

const kafka = new Kafka({
  clientId: "auth-service",
  brokers: ["kafka:9093"],
});
const consumer = kafka.consumer({
  groupId: "compensation-group",
});
const prisma = new PrismaClient();

async function connectCompensationConsumer() {
  await consumer.connect();
  console.log("Kafka Compensation Consumer Connected (Auth Service)");

  await consumer.subscribe({
    topic: "compensate_user_deletion",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { user } = JSON.parse(message.value);
      console.warn(`Compensation triggered: Restoring user ${user.id}`);

      try {
        // Restore user in auth-service
        await prisma.user.create({
          data: user,
        });

        console.log(`User ${user.id} restored due to task-service failure`);
      } catch (error) {
        console.error("Failed to restore user:", error.message);
      }
    },
  });
}

module.exports = { connectCompensationConsumer };
