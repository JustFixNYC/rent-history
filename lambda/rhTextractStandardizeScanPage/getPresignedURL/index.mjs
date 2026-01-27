// https://www.alter-solutions.com/articles/file-upload-amazon-s3-url

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Configuration = {
    region: process.env.AWS_REGION_NAME,
};
const client = new S3Client(s3Configuration);

export const handler = async (event, context) => {
  const key = event.queryStringParameters.key
  const command = new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key});
  const uploadURL = await getSignedUrl(client, command, { expiresIn: process.env.URL_EXPIRATION_SECONDS });
  
  return {
    "statusCode": 200,
    "isBase64Encoded": false,
    "headers": {
      "Access-Control-Allow-Origin": "*"
    },
    "body": JSON.stringify({
      "uploadURL": uploadURL,
      "key": key
    })
  };
}