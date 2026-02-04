import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

const s3Configuration = {
  region: process.env.AWS_REGION_NAME || "us-east-1",
};
const client = new S3Client(s3Configuration);

const checkParams = (historyCode) => {
  if (!historyCode) {
    return {
      statusCode: 400,
      isBase64Encoded: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Missing history_code parameter",
      }),
    };
  }
};

export const handler = async (event) => {
  const historyCode = event.queryStringParameters.history_code;

  const invalidParamsResponse = checkParams(historyCode);
  if (invalidParamsResponse) return invalidParamsResponse;

  // (not handling pagination since there can only be as many objects as RH pages)
  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.BUCKET_NAME,
    Prefix: historyCode + "/",
  });

  const list = await client.send(listCommand);

  if (!list.Contents || list.Contents.length == 0) {
    return {
      statusCode: 404,
      isBase64Encoded: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "History code not found",
      }),
    };
  }

  const objectsToDelete = list.Contents.map((obj) => ({ Key: obj.Key }));

  const deleteCommand = new DeleteObjectsCommand({
    Bucket: process.env.BUCKET_NAME,
    Delete: {
      Objects: objectsToDelete,
      Quiet: false,
    },
  });

  const deleted = await client.send(deleteCommand);

  const response = {
    statusCode: 200,
    body: JSON.stringify(
      `Sucessfully deleted all ${deleted.Deleted.length} scan images for ${historyCode}`,
    ),
  };
  return response;
};
