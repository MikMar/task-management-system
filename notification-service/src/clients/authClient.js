const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("proto/auth.proto");
const authProto = grpc.loadPackageDefinition(packageDefinition).AuthService;

const authClient = new authProto(
  "auth-service:50051",
  grpc.credentials.createInsecure()
);

module.exports = authClient;
