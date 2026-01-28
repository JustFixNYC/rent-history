import {
  TextractClient,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { TextractDocument } from "amazon-textract-response-parser";

const config = { region: "us-east-1" };
const textractClient = new TextractClient(config);
const s3Client = new S3Client(config);

const getS3ObjectDetails = (event) => {
  const bucket = event["Records"][0]["s3"]["bucket"]["name"];
  const key = event["Records"][0]["s3"]["object"]["key"];
  const [historyCode, fileName] = key.split("/");
  const pageNumber = fileName.match(/(\d+)/g)[0];
  const details = { bucket, key, historyCode, fileName, pageNumber };
  console.log(details);
  return details;
};

const saveDataToS3Json = async (key, body) => {
  const params = {
    Bucket: process.env.TEXTRACT_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(body, null, 2),
  };
  const command = new PutObjectCommand(params);
  const data = await s3Client.send(command);
  return data;
};

const saveDataToAuthProviderDB = async (stanadrdizedData) => {
  return true;
};

const analyzeDocumentForTables = async (bucket, key) => {
  const params = {
    Document: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    FeatureTypes: ["TABLES"],
  };

  try {
    const command = new AnalyzeDocumentCommand(params);
    const data = await textractClient.send(command);
    console.log("textractResponse", data);
    return data;
  } catch (err) {
    console.error("Error processing document with Textract:", err);
    throw new Error("Error processing document with Textract");
  }
};

const parseRentHistoryTables = (textractResponse) => {
  const doc = new TextractDocument(textractResponse);
  const page = doc.pageNumber(1);

  let parsedTables = [];
  for (const table of page.iterTables()) {
    parsedTables.push(parseTable(table));
  }
  return parsedTables;
};

const parseTable = (table) => {
  const tableContents = [];
  for (const row of table.iterRows()) {
    let rowContents = [];
    for (const cell of row.iterCells()) {
      rowContents.push(cell.text);
    }
    tableContents.push(rowContents);
  }

  return {
    tableConfidence: table.confidence,
    tableType: table.tableType,
    tableContentsConfidence: table.getOcrConfidence(),
    tableContents,
  };
};

export const handler = async (event) => {
  console.log(
    "Lambda function started with event:",
    JSON.stringify(event, null, 2),
  );

  const { bucket, key, historyCode, pageNumber } = getS3ObjectDetails(event);

  const textractResponse = await analyzeDocumentForTables(bucket, key);
  const rentHistoryTables = parseRentHistoryTables(textractResponse);

  const jsonKey = `${historyCode}/page${pageNumber}.json`;
  const rentHistoryTablesJson = await saveDataToS3Json(
    jsonKey,
    rentHistoryTables,
  );

  console.log(rentHistoryTablesJson);

  const response = {
    statusCode: 200,
    body: JSON.stringify("Tables extracted from rent history scans"),
  };
  return response;
};
