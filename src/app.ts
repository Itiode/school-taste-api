import express from "express";
import { Mongoose } from "mongoose";
import config from "config";
import cors from "cors";

import error from "./middleware/auth";
import connectToDB from "./main/db";
import initializeFirebase from "./main/firebase";

import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import commentRoutes from "./routes/comment";
import subPostRoutes from "./routes/sub-post";
import subCommentRoutes from "./routes/sub-comment";
import notificationRoutes from "./routes/notification";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/sub-posts", subPostRoutes);
app.use("/api/sub-comments", subCommentRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(error);

connectToDB((db: Mongoose | null, err: Error | null) => {
  if (!err) {
    const port = parseInt(config.get("port")) || 3200;
    app.listen(port, () => {
      console.log("Connected to DB:", config.get("dbUrl"));
      console.log("Listening on port:", port);
    });

    initializeFirebase((err: Error | null) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Firebase initialized");
      }
    });
  } else {
    console.error("Error in connecting to DB: " + err);
  }
});
