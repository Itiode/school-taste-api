"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("config"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./middleware/auth"));
const db_1 = __importDefault(require("./main/db"));
const firebase_1 = __importDefault(require("./main/firebase"));
const user_1 = __importDefault(require("./routes/user"));
const auth_2 = __importDefault(require("./routes/auth"));
const post_1 = __importDefault(require("./routes/post"));
const post_comment_1 = __importDefault(require("./routes/comment/post-comment"));
const sub_post_1 = __importDefault(require("./routes/sub-post"));
const sub_post_comment_1 = __importDefault(require("./routes/comment/sub-post-comment"));
const notification_1 = __importDefault(require("./routes/notification"));
const school_1 = __importDefault(require("./routes/student-data/school"));
const faculty_1 = __importDefault(require("./routes/student-data/faculty"));
const department_1 = __importDefault(require("./routes/student-data/department"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static("public"));
app.use("/api/users", user_1.default);
app.use("/api/auth", auth_2.default);
app.use("/api/posts", post_1.default);
app.use("/api/post-comments", post_comment_1.default);
app.use("/api/sub-posts", sub_post_1.default);
app.use("/api/sub-post-comments", sub_post_comment_1.default);
app.use("/api/notifications", notification_1.default);
app.use("/api/schools", school_1.default);
app.use("/api/faculties", faculty_1.default);
app.use("/api/departments", department_1.default);
// {
//   "port": "3200",
//   "dbUrl": "mongodb://localhost:27017/school-taste",
//   "serverAddress": "http://192.168.43.120:3200/",
//   "jwtAuthPrivateKey": "unsecureJwtAuthPrivateKey",
//   "awsBucketName": "school-taste-bucket",
//   "awsBucketRegion": "us-east-1",
//   "awsBucketAccessKeyId": "ACCESS_ID",
//   "awsBucketSecretAccessKey": "SECRET_ACCESS_KEY"
// }
app.use(auth_1.default);
(0, db_1.default)((db, err) => {
    if (!err) {
        const port = process.env.PORT || 3200;
        app.listen(port, () => {
            console.log("Connected to DB:", config_1.default.get("dbUrl"));
            console.log("Listening on port:", port);
        });
        (0, firebase_1.default)((err) => {
            if (err) {
                console.error(err);
            }
            else {
                console.log("Firebase initialized");
            }
        });
    }
    else {
        console.error("Error in connecting to DB: " + err);
    }
});
