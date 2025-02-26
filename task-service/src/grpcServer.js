const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { PrismaClient } = require("@prisma/client");
const { UpdateTaskSchema, CreateTaskSchema } = require("./schemas/taskSchema");
const { handleGrpcCall } = require("./helpers/helper");
const { sendTaskCreatedMessage, connectProducer } = require("./producer");

const prisma = new PrismaClient();
const packageDefinition = protoLoader.loadSync("proto/task.proto");
const taskProto = grpc.loadPackageDefinition(packageDefinition).TaskService;

async function createTask(call, callback) {
  await handleGrpcCall(call, callback, async (data) => {
    const validatedData = await CreateTaskSchema.parseAsync(data);
    const newTask = await prisma.task
      .create({ data: validatedData })
      .catch((error) => {
        console.log(error);
        throw new Error(
          "The table `public.Task` does not exist in the current database."
        );
      });

    if (newTask.assignedTo) {
      await sendTaskCreatedMessage(newTask.assignedTo, newTask.id);
    }

    const formattedTask = {
      ...newTask,
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString(),
    };

    return formattedTask;
  });
}

async function listTasks(call, callback) {
  await handleGrpcCall(call, callback, async (data) => {
    const { assignedTo, status } = data;
    const where = {};
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({ where });
    return { tasks };
  });
}

async function getTask(call, callback) {
  await handleGrpcCall(call, callback, async (data) => {
    const task = await prisma.task.findUnique({
      where: { id: Number(data.id) },
    });
    if (task) {
      return task;
    } else {
      throw new Error("Not Found");
    }
  });
}

async function updateTask(call, callback) {
  await handleGrpcCall(call, callback, async (data) => {
    try {
      const validatedData = await UpdateTaskSchema.parseAsync(data);
      const task = await prisma.task.update({
        where: { id: Number(data.id) },
        data: validatedData,
      });
      return task;
    } catch (error) {
      if (error.code === "P2025") {
        throw new Error("Not Found");
      } else {
        throw error;
      }
    }
  });
}

async function deleteTask(call, callback) {
  await handleGrpcCall(call, callback, async (data) => {
    try {
      await prisma.task.delete({
        where: { id: Number(data.id) },
      });
      return {};
    } catch (error) {
      if (error.code === "P2025") {
        throw new Error("Not Found");
      } else {
        throw error;
      }
    }
  });
}

const server = new grpc.Server();

server.addService(taskProto.service, {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
});

async function start() {
  try {
    await connectProducer();
  } catch (error) {
    console.error("Error connecting Kafka producer:", error);
  }
}

server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    start();
    console.log("Server running at http://0.0.0.0:50052");
  }
);
