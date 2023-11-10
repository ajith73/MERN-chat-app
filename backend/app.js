import express from "express";
import dotenv from "dotenv";
dotenv.config();

import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import "express-async-errors";

// import { createServer } from "http";
//socket
//connect DB
import connectDB from "./api/db/connect.js";
import cors from "cors";
// const path = require("path");

//middleware
import notFoundMiddleware from "./api/middleware/not-found.js";
import errorHandlerMiddleware from "./api/middleware/error-handler.js";
import authenticateUser from "./api/middleware/auth.js";

//routes
import authRoute from "./api/routes/auth.js";
import chatRoute from "./api/routes/chat.js";
import messageRoute from "./api/routes/message.js";

const start = async () => {
  try {
    // console.log(process.env.MONGO_URL)
    await connectDB(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useFindAndModify: true,
    });
    // server.listen(port, () =>
    //   console.log(`Server Running on port : ${port}...`)
    // );
  } catch (error) {
    console.log(error);
  }
};
start();

const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.get("/", (req, res) => {
  res.send("Server Running!");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/chat", authenticateUser, chatRoute);
app.use("/api/v1/message", authenticateUser, messageRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// const __dirname1 = path.resolve();

// const port = process.env.PORT || 5000;
// const server = createServer(app);

export default app;