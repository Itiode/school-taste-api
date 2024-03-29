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
import postCommentRoutes from "./routes/comment/post-comment";
import subPostRoutes from "./routes/sub-post";
import subPostCommentRoutes from "./routes/comment/sub-post-comment";
import notificationRoutes from "./routes/notification";
import schoolRoutes from "./routes/student-data/school";
import facultyRoutes from "./routes/student-data/faculty";
import departmentRoutes from "./routes/student-data/department";
import levelRoutes from "./routes/student-data/level";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/post-comments", postCommentRoutes);
app.use("/api/sub-posts", subPostRoutes);
app.use("/api/sub-post-comments", subPostCommentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/levels", levelRoutes);

app.use(error);

connectToDB((db: Mongoose | null, err: Error | null) => {
  if (!err) {
    const port = process.env.PORT || 3200;
    app.listen(port, () => {
      console.log("Connected to", config.get("dbUrl"));
      console.log("Listening on port", port);
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
