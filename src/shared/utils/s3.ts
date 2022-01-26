import config from "config";
import S3 from "aws-sdk/clients/s3";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import util from "util";

const bucketName: string = config.get("awsBucketName");
const region: string = config.get("awsBucketRegion");
const accessKeyId: string = config.get("awsBucketAccessKeyId");
const secretAccessKey: string = config.get("awsBucketSecretAccessKey");

export default multer.diskStorage({
  destination: "public/uploads",
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".")[1];
    const filename = `ST_IMG_${nanoid()}.${ext}`;
    cb(null, filename);
  },
});

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// Upload a file to S3
export function uploadFileToS3(
  folderName: "post-images" | "profile-images" | "cover-images",
  filePath: fs.PathLike,
  fileName: string
) {
  const fileStream = fs.createReadStream(filePath);

  const params: S3.PutObjectRequest = {
    Bucket: bucketName,
    Body: fileStream,
    Key: `${folderName}/${fileName}`,
  };

  return s3.upload(params).promise();
}

const unlinkFile = util.promisify(fs.unlink);

export function deleteFileFromFS(filePath: string) {
  return unlinkFile(filePath);
}

// Download a file from S3
export function getFileFromS3(
  folderName: "post-images" | "profile-images" | "cover-images",
  filename: string
) {
  const params: S3.GetObjectRequest = {
    Key: `${folderName}/${filename}`,
    Bucket: bucketName,
  };

  return s3.getObject(params).createReadStream();
}

// Delete a file from S3
export function deleteFileFromS3(
  folderName: "post-images" | "profile-images" | "cover-images",
  filename: string
) {
  const params: S3.DeleteObjectRequest = {
    Key: `${folderName}/${filename}`,
    Bucket: bucketName,
  };

  return s3.deleteObject(params).promise();
}
