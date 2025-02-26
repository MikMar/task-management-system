const handleGrpcResponse = (
  grpcMethod,
  data,
  res,
  retries = 3,
  delay = 1000
) => {
  function attempt(remainingRetries) {
    grpcMethod(data, (error, response) => {
      if (!error) return res.json(response);

      if (remainingRetries <= 0) {
        return res.status(400).json({ error: error.message });
      }

      console.warn(
        `Retrying in ${delay}ms... (${remainingRetries} retries left)`
      );
      setTimeout(() => attempt(remainingRetries - 1), delay);
    });
  }

  attempt(retries);
};

module.exports = { handleGrpcResponse };
