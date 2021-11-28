"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postImagesStorageConfig = void 0;
// import multer from "multer";
const multer_s3_1 = __importDefault(require("multer-s3"));
const nanoid_1 = require("nanoid");
const config_1 = __importDefault(require("config"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const bucketName = config_1.default.get("awsBucketName");
const region = config_1.default.get("awsBucketRegion");
const accessKeyId = config_1.default.get("awsBucketAccessKeyId");
const secretAccessKey = config_1.default.get("awsBucketSecretAccessKey");
const s3 = new s3_1.default({
    region,
    accessKeyId,
    secretAccessKey,
});
// const unlinkFile = util.promisify(fs.unlink);
exports.postImagesStorageConfig = (0, multer_s3_1.default)({
    s3: s3,
    bucket: bucketName,
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        const ext = file.originalname.split(".")[1];
        const filename = `${"post-images"}/ST_IMG_${(0, nanoid_1.nanoid)()}.${ext}`;
        cb(null, filename);
    },
});
// export default multer.diskStorage({
//   destination: "public/uploads",
//   filename: function (req, file, cb) {
//     const ext = file.originalname.split(".")[1];
//     const filename = `ST_IMG_${nanoid()}.${ext}`;
//     cb(null, filename);
//   },
// });
// export async function deleteFile(filePath: string) {
//   try {
//     await unlinkFile(filePath);
//   } catch (e) {
//     throw new Error("Error in deleting file: " + e);
//   }
// }
