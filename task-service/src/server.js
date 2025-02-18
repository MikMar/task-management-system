const express = require("express");
const app = express();
const test = require("./routes/route");

app.get("/", (req, res) => {
  res.send("Task Service is running!");
});

app.listen(4000, () => console.log("Task Service running on port 4000"));
