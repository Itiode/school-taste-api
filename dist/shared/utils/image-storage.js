"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const nanoid_1 = require("nanoid");
exports.default = multer_1.default.diskStorage({
    destination: "public/uploads",
    filename: function (req, file, cb) {
        const ext = file.originalname.split(".")[1];
        const filename = `ST_IMG_${(0, nanoid_1.nanoid)()}.${ext}`;
        cb(null, filename);
    },
});
