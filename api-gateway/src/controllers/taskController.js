const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { handleGrpcResponse } = require("../helpers/helper");

const packageDefinition = protoLoader.loadSync("proto/task.proto");
const taskProto = grpc.loadPackageDefinition(packageDefinition).TaskService;

const client = new taskProto(
  "task-service:50052",
  grpc.credentials.createInsecure()
);

exports.createTask = (req, res) => {
  const taskData = req.body;
  handleGrpcResponse(client.createTask.bind(client), taskData, res);
};

exports.listTasks = (req, res) => {
  const filters = req.query;
  handleGrpcResponse(client.listTasks.bind(client), filters, res);
};

exports.getTaskById = (req, res) => {
  const taskId = { id: req.params.id };
  handleGrpcResponse(client.getTaskById.bind(client), taskId, res);
};

exports.updateTask = (req, res) => {
  const taskId = { id: req.params.id };
  const taskData = req.body;
  const updateData = { ...taskId, ...taskData };
  handleGrpcResponse(client.updateTask.bind(client), updateData, res);
};

exports.deleteTask = (req, res) => {
  const taskId = { id: req.params.id };
  handleGrpcResponse(client.deleteTask.bind(client), taskId, res);
};
