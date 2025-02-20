const express = require("express");
const app = express();
const authRouter = require("./routes/authRouter");
const taskRouter = require("./routes/taskRouter");
const verifyToken = require("./middlewares/verifyTokenMiddleware");
const errorHandlerMiddleware = require("./middlewares/errorHandlerMiddleware");

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/task", verifyToken, taskRouter);

app.use(errorHandlerMiddleware);

app.listen(3000, () => console.log("API Gateway running on port 3000"));
