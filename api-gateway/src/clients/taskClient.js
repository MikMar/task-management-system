const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("proto/task.proto");
const taskProto = grpc.loadPackageDefinition(packageDefinition).TaskService;

const taskClient = new taskProto(
  "task-service:50052",
  grpc.credentials.createInsecure()
);

module.exports = taskClient;
