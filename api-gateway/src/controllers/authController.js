const authClient = require("../clients/authClient");
const { handleGrpcResponse } = require("../helpers/helper");

const register = async (req, res) => {
  handleGrpcResponse(authClient.Register.bind(authClient), req.body, res);
};

const login = async (req, res) => {
  handleGrpcResponse(authClient.Login.bind(authClient), req.body, res);
};

const logout = async (req, res) => {
  handleGrpcResponse(
    authClient.Logout.bind(authClient),
    { userId: req.user.id },
    res
  );
};

const deleteUser = async (req, res) => {
  handleGrpcResponse(
    authClient.DeleteUser.bind(authClient),
    { userId: req.user.id },
    res
  );
};

module.exports = {
  register,
  login,
  logout,
  deleteUser,
};
