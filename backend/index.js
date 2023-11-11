import express from "express";
import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import "express-async-errors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./db/connect.js";
import cors from "cors";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authenticateUser from "./middleware/auth.js";
import authRoute from "./routes/auth.js";
import chatRoute from "./routes/chat.js";
import messageRoute from "./routes/message.js";

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

const port = process.env.PORT || 5000;
const server = createServer(app);

const start = async () => {
  try {
  const uri = process.env.MONGO_URL || `mongodb+srv://ajith73:7395858781@cluster0.gukoo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    await connectDB(uri);//process.env.MONGO_URL
    server.listen(port, () =>
      console.log(`Server Running on port : ${port}...`)
    );

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
    origin: "\*",
      }
    });

    io.on("connection", (socket) => {
      console.log("Connected to socket.io");
      socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
      });

      socket.on("join-chat", (room) => {
        socket.join(room);
      });

      socket.on("typing", (room) => socket.in(room).emit("typing"));
      socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));

      socket.on("new-message", (newMessageReceived) => {
        let chat = newMessageReceived.chat;

        if (!chat.users) return console.log(`chat.users not defined`);

        chat.users.forEach((user) => {
          if (user._id === newMessageReceived.sender._id) return;

          socket.in(user._id).emit("message-received", newMessageReceived);
        });
      });

      socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

start();
