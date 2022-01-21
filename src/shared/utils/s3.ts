import config from "config";
import S3 from "aws-sdk/clients/s3";
import multerS3 from "multer-s3";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import util from "util";

const bucketName: string = config.get("awsBucketName");
const region: string = config.get("awsBucketRegion");
const accessKeyId: string = config.get("awsBucketAccessKeyId");
const secretAccessKey: string = config.get("awsBucketSecretAccessKey");

// export function getStorageConfig(
//   folderName: "post-images" | "profile-images" | "cover-images"
// ) {
//   const config = multerS3({
//     s3: s3,
//     bucket: bucketName,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       const ext = file.originalname.split(".")[1];
//       const filename = `${folderName}/ST_IMG_${nanoid()}.${ext}`;
//       cb(null, filename);
//     },
//   });

//   return config;
// }

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

  const uploadParams: S3.PutObjectRequest = {
    Bucket: bucketName,
    Body: fileStream,
    Key: `${folderName}/${fileName}`,
  };

  return s3.upload(uploadParams).promise();
}

const unlinkFile = util.promisify(fs.unlink);

export function delFileFromFS(filePath: string) {
  return unlinkFile(filePath);
}

// Download a file from S3
export function getFileFromS3(
  folderName:
    | "post-images"
    | "post-thumbnail-images"
    | "profile-images"
    | "profile-thumbnail-images"
    | "cover-images"
    | "cover-thumbnail-images",
  filename: string
) {
  const downloadParams: S3.GetObjectRequest = {
    Key: `${folderName}/${filename}`,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}
