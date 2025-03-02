const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const { publishUserDeleted, connectProducer } = require("./kafka/producer");
const { connectCompensationConsumer } = require("./kafka/consumer");

const prisma = new PrismaClient();
const packageDefinition = protoLoader.loadSync("proto/auth.proto");
const authProto = grpc.loadPackageDefinition(packageDefinition).AuthService;

const SECRET = process.env.JWT_SECRET;

connectProducer().catch(console.error);
connectCompensationConsumer().catch(console.error);

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
      data: { email, password: hashedPassword, tokenVersion: 1 },
    });

    const token = jwt.sign(
      { userId: user.id, tokenVersion: user.tokenVersion },
      SECRET,
      {
        expiresIn: "1h",
      }
    );
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

    const newTokenVersion = user.tokenVersion + 1;

    await prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: newTokenVersion },
    });

    const token = jwt.sign(
      { userId: user.id, tokenVersion: newTokenVersion },
      SECRET,
      { expiresIn: "1h" }
    );

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

    callback(null, { exists: true, email: user.email });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

async function verifyToken(call, callback) {
  const { token } = call.request;

  if (!token) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "Token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return callback({
        code: grpc.status.UNAUTHENTICATED,
        details: "Invalid token",
      });
    }

    callback(null, { valid: true, userId: decoded.userId });
  } catch (error) {
    callback({
      code: grpc.status.UNAUTHENTICATED,
      details: "Invalid token",
    });
  }
}

async function logout(call, callback) {
  const { userId } = call.request;

  if (!userId) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "User ID is required",
    });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: 0 },
    });

    callback(null, { success: true });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

async function getUserInfo(call, callback) {
  const { userId } = call.request;

  if (!userId) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "User ID is required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        role: true,
      },
    });

    if (!user) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: "User not found",
      });
    }

    callback(null, { email: user.email, role: user.role });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

async function deleteUser(call, callback) {
  const { userId } = call.request;

  if (!userId) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: "User ID is required",
    });
  }

  try {
    const user = await prisma.user.delete({ where: { id: userId } });

    await publishUserDeleted(user);

    callback(null, { success: true });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: error.message,
    });
  }
}

const server = new grpc.Server();
server.addService(authProto.service, {
  register,
  login,
  verifyToken,
  userExists,
  logout,
  getUserInfo,
  deleteUser,
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Auth Service running on gRPC port 50051");
  }
);
