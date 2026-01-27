// https://www.alter-solutions.com/articles/file-upload-amazon-s3-url

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Configuration = {
  region: process.env.AWS_REGION_NAME,
};
const client = new S3Client(s3Configuration);

const checkParams = (keys, method) => {
  if (!keys) {
    return {
      "statusCode": 400,
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      "body": JSON.stringify({
        "error": "Missing key parameter"
      })
    }
  }
  if (!method || (method !== 'PUT' && method !== 'GET')) {
    return {
      "statusCode": 400,
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      "body": JSON.stringify({
        "error": "Missing or invalid method parameter"
      })
    }
  }
}

export const handler = async (event, context) => {
  const method = event.queryStringParameters.method
  const keys = event.multiValueQueryStringParameters.key;

  console.log(method, keys)

  const invalidParamsResponse = checkParams(keys, method)
  if (invalidParamsResponse) return invalidParamsResponse;

  const options = { expiresIn: process.env.URL_EXPIRATION_SECONDS }

  let presignedUrlPromises;
  if (method === "GET") {
    presignedUrlPromises = keys.map(async key => {
      const command = new GetObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key })
      const url = await getSignedUrl(client, command, options)
      return {key, url}
    })
  } else if (method === "PUT") {
    presignedUrlPromises = keys.map(async key => {
      const command = new PutObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key });
      const uploadURL = await getSignedUrl(client, command, options);
      return {key, url}
    })
  }

  const urls = await Promise.all(presignedUrlPromises)

  return {
    "statusCode": 200,
    "isBase64Encoded": false,
    "headers": {
      "Access-Control-Allow-Origin": "*"
    },
    "body": JSON.stringify(urls)
  };
}