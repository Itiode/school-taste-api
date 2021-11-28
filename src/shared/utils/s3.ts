import config from "config";
import S3 from "aws-sdk/clients/s3";
import multerS3 from "multer-s3";
import { nanoid } from "nanoid";

const bucketName: string = config.get("awsBucketName");
const region: string = config.get("awsBucketRegion");
const accessKeyId: string = config.get("awsBucketAccessKeyId");
const secretAccessKey: string = config.get("awsBucketSecretAccessKey");

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

export function getStorageConfig(folderName: "post-images" | "profile-images") {
  const config = multerS3({
    s3: s3,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const ext = file.originalname.split(".")[1];
      const filename = `${folderName}/ST_IMG_${nanoid()}.${ext}`;
      cb(null, filename);
    },
  });

  return config;
}

// Download a file from S3
export function getFileFromS3(
  folderName: "post-images" | "profile-images",
  filename: string
) {
  const downloadParams: S3.GetObjectRequest = {
    Key: `${folderName}/${filename}`,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}

// // Upload a file to S3
// export function uploadFileToS3(folderName: string, file: any) {
//   const fileStream = fs.createReadStream(file.path);

//   const uploadParams: S3.PutObjectRequest = {
//     Bucket: bucketName,
//     Body: fileStream,
//     Key: `${folderName}/${file.filename}`,
//   };

//   return s3.upload(uploadParams).promise();
// }

// const unlinkFile = util.promisify(fs.unlink);

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
