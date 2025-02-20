const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { PrismaClient } = require("@prisma/client");
const { TaskSchema } = require("./schemas/taskSchema");
const { handleGrpcCall } = require("./helpers/helper");

const prisma = new PrismaClient();
const packageDefinition = protoLoader.loadSync("proto/task.proto");
const taskProto = grpc.loadPackageDefinition(packageDefinition).TaskService;

async function createTask(call, callback) {
  await handleGrpcCall(call, callback, async (data) => {
    const validatedData = TaskSchema.parse(data);
    const newTask = await prisma.task
      .create({ data: validatedData })
      .catch((error) => {
        console.log(error);
        throw new Error(
          "The table `public.Task` does not exist in the current database."
        );
      });

    const formattedTask = {
      ...newTask,
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString(),
    };

    return formattedTask;
  });
}

async function listTasks(call, callback) {
  try {
    const { assignedTo, status } = call.request;
    const where = {};
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({ where });
    callback(null, { tasks });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

async function getTask(call, callback) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: call.request.id },
    });
    if (task) {
      callback(null, task);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    }
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

async function updateTask(call, callback) {
  try {
    const task = await prisma.task.update({
      where: { id: call.request.id },
      data: call.request,
    });
    callback(null, task);
  } catch (error) {
    if (error.code === "P2025") {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    } else {
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }
}

async function deleteTask(call, callback) {
  try {
    await prisma.task.delete({
      where: { id: call.request.id },
    });
    callback(null, {});
  } catch (error) {
    if (error.code === "P2025") {
      callback({
        code: grpc.status.NOT_FOUND,
        details: "Not Found",
      });
    } else {
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }
}

const server = new grpc.Server();

server.addService(taskProto.service, {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
});

server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Server running at http://0.0.0.0:50052");
  }
);
