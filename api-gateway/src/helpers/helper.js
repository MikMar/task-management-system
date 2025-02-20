const handleGrpcResponse = (grpcMethod, data, res) => {
  grpcMethod(data, (error, response) => {
    if (error) return res.status(400).json({ error: error.message });
    res.json(response);
  });
};

module.exports = { handleGrpcResponse };
