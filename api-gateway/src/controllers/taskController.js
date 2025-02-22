const taskClient = require("../clients/taskClient");
const { handleGrpcResponse } = require("../helpers/helper");

exports.createTask = (req, res) => {
  const taskData = req.body;
  handleGrpcResponse(taskClient.createTask.bind(taskClient), taskData, res);
};

exports.listTasks = (req, res) => {
  const filters = req.query;
  handleGrpcResponse(taskClient.listTasks.bind(taskClient), filters, res);
};

exports.getTaskById = (req, res) => {
  const taskId = { id: req.params.id };
  handleGrpcResponse(taskClient.getTaskById.bind(taskClient), taskId, res);
};

exports.updateTask = (req, res) => {
  const taskId = { id: req.params.id };
  const taskData = req.body;
  const updateData = { ...taskId, ...taskData };
  handleGrpcResponse(taskClient.updateTask.bind(taskClient), updateData, res);
};

exports.deleteTask = (req, res) => {
  const taskId = { id: req.params.id };
  handleGrpcResponse(taskClient.deleteTask.bind(taskClient), taskId, res);
};
