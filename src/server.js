import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import postsRouter from "./apis/posts/index.js";
import usersRouter from "./apis/users/index.js";
import pictureRouter from "./apis/images/exp-profile.js";
import createHttpError from "http-errors";

const server = express();
const port = process.env.PORT || 3001;

//MIDDLEWARES

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (origin, corsNext) => {
      if (!origin || whiteList.indexOf(origin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(createHttpError(400, `Cors error`));
      }
    },
  })
);
server.use(express.json());

//ENDPOINTS

server.use("/users", usersRouter);
server.use("/profile", pictureRouter);
server.use("/posts", postsRouter);

//ERROR HANDLERS

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port: ${port}`);
  });
});
