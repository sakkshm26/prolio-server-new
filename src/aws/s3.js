import S3 from "aws-sdk/clients/s3.js";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import multerS3 from "multer-s3";
import {v4} from "uuid"

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

const upload = () =>
multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `image-${v4()}.jpeg`);
    },
  }),
});

export {upload, s3 };
