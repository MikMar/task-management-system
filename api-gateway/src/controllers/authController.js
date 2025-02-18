const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("proto/auth.proto");
const authProto = grpc.loadPackageDefinition(packageDefinition).AuthService;

const client = new authProto(
  "auth-service:50051",
  grpc.credentials.createInsecure()
);

const register = async (req, res) => {
  client.Register(req.body, (error, response) => {
    if (error) return res.status(400).json({ error: error.message });
    res.json(response);
  });
};

const login = async (req, res) => {
  client.Login(req.body, (error, response) => {
    if (error) return res.status(400).json({ error: error.message });
    res.json(response);
  });
};

const logout = async (req, res) => {
  return res.json({ message: "Login" });
};

const user = async (req, res) => {
  return res.json({ message: "User" });
};

module.exports = {
  register,
  login,
  logout,
  user,
};
