"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileFromS3 = exports.getFileFromS3 = exports.deleteFileFromFS = exports.uploadFileToS3 = void 0;
const config_1 = __importDefault(require("config"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const multer_1 = __importDefault(require("multer"));
const nanoid_1 = require("nanoid");
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const bucketName = config_1.default.get("awsBucketName");
const region = config_1.default.get("awsBucketRegion");
const accessKeyId = config_1.default.get("awsBucketAccessKeyId");
const secretAccessKey = config_1.default.get("awsBucketSecretAccessKey");
exports.default = multer_1.default.diskStorage({
    destination: "public/uploads",
    filename: function (req, file, cb) {
        const ext = file.originalname.split(".")[1];
        const filename = `ST_IMG_${(0, nanoid_1.nanoid)()}.${ext}`;
        cb(null, filename);
    },
});
const s3 = new s3_1.default({
    region,
    accessKeyId,
    secretAccessKey,
});
// Upload a file to S3
function uploadFileToS3(folderName, filePath, fileName) {
    const fileStream = fs_1.default.createReadStream(filePath);
    const params = {
        Bucket: bucketName,
        Body: fileStream,
        Key: `${folderName}/${fileName}`,
    };
    return s3.upload(params).promise();
}
exports.uploadFileToS3 = uploadFileToS3;
const unlinkFile = util_1.default.promisify(fs_1.default.unlink);
function deleteFileFromFS(filePath) {
    return unlinkFile(filePath);
}
exports.deleteFileFromFS = deleteFileFromFS;
// Download a file from S3
function getFileFromS3(folderName, filename) {
    const params = {
        Key: `${folderName}/${filename}`,
        Bucket: bucketName,
    };
    return s3.getObject(params).createReadStream();
}
exports.getFileFromS3 = getFileFromS3;
// Delete a file from S3
function deleteFileFromS3(folderName, filename) {
    const params = {
        Key: `${folderName}/${filename}`,
        Bucket: bucketName,
    };
    return s3.deleteObject(params).promise();
}
exports.deleteFileFromS3 = deleteFileFromS3;
