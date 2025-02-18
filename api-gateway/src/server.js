const express = require("express");
const app = express();
const authRouter = require("./routes/authRouter") ;

app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(3000, () => console.log("API Gateway running on port 3000"));
