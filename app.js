require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const connectDB = require("./db/connect");
const authRoute = require("./routes/auth");
// const jobRoute = require("./routes/jobs");
const footballRoute = require("./routes/football");
const basketballRoute = require("./routes/basketball");
const baseballRoute = require("./routes/baseball");
const handballRoute = require("./routes/handball");
const hockeyRoute = require("./routes/hockey");

//middlewares
const authenticate = require("./middleware/authentication");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(express.json());
// extra packages

// routes
app.use("/api/v1", authRoute);
app.use("/api/v1", footballRoute);
app.use("/api/v1", basketballRoute);
app.use("/api/v1", baseballRoute);
app.use("/api/v1", handballRoute);
app.use("/api/v1", hockeyRoute);
// app.use("/api/v1", authenticate, jobRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
