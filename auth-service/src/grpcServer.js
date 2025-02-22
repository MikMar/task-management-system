const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();
const packageDefinition = protoLoader.loadSync("proto/auth.proto");
const authProto = grpc.loadPackageDefinition(packageDefinition).AuthService;

const SECRET = process.env.JWT_SECRET;

async function register(call, callback) {
  const { email, password } = call.request;

  if (!email || !password) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "Email and password are required",
    });
  }

  try {
    bcrypt.setRandomFallback(() => crypto.randomBytes(16));
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1h" });
    callback(null, { token });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

async function login(call, callback) {
  const { email, password } = call.request;

  if (!email || !password) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "Email and password are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return callback(new Error("Invalid credentials"));
    }

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: "1h" });

    callback(null, { token });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

async function userExists(call, callback) {
  const { userId } = call.request;

  console.log(userId);

  if (!userId) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "User ID is required",
    });
  }

  if (!(typeof userId === "string" && /^[0-9a-fA-F]{24}$/.test(userId))) {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "Invalid userId provided",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return callback(null, { exists: false });
    }

    callback(null, { exists: true });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

const server = new grpc.Server();
server.addService(authProto.service, { register, login, userExists });

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Auth Service running on gRPC port 50051");
  }
);
