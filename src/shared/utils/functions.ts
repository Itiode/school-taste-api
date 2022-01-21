import sharp from "sharp";
import moment from "moment";
import { CompressedImage, Metadata } from "../../types/shared";

export function formatDate(date: string) {
  return moment(date).fromNow();
}

export function getNotificationPayload(payload: string) {
  return payload.length > 100 ? `${payload.slice(0, 97)}...` : payload;
}

export function compressImage(
  inputPath: string,
  filename: string,
  meta: Metadata
): Promise<CompressedImage> {
  const outputPath = `public/uploads/${filename}`;

  return new Promise((resolve, reject) => {
    sharp(inputPath)
      .resize(meta.width, meta.height)
      .toFile(outputPath, (err, resizedImage) => {
        if (err) {
          reject(err);
        } else {
          const compImg = { ...resizedImage, name: filename, path: outputPath };
          resolve(compImg);
        }
      });
  });
}
