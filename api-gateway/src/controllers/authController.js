const authClient = require("../clients/authClient");
const { handleGrpcResponse } = require("../helpers/helper");

const register = async (req, res) => {
  handleGrpcResponse(authClient.Register.bind(authClient), req.body, res);
};

const login = async (req, res) => {
  handleGrpcResponse(authClient.Login.bind(authClient), req.body, res);
};

const logout = async (req, res) => {
  handleGrpcResponse(authClient.Logout.bind(authClient), {}, res);
};

module.exports = {
  register,
  login,
  logout,
};
