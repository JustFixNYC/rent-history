import {
  TextractClient,
  AnalyzeDocumentCommand,
  type AnalyzeDocumentCommandInput,
  type AnalyzeDocumentCommandOutput,
} from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  Page,
  TextractDocument,
  type ApiAnalyzeDocumentResponse,
} from "amazon-textract-response-parser";
import type { S3Event, Context, Handler } from "aws-lambda";
import type { TableGeneric } from "amazon-textract-response-parser/dist/types/table";

const config = { region: "us-east-1" };
const textractClient = new TextractClient(config);
const s3Client = new S3Client(config);

const getS3ObjectDetails = (event: S3Event) => {
  if (!event["Records"][0]) throw new Error("No record in event");
  const bucket = event["Records"][0]!["s3"]["bucket"]["name"];
  const key = event["Records"][0]!["s3"]["object"]["key"];
  const [historyCode, fileName] = key.split("/");
  if (!historyCode || !fileName)
    throw new Error("No history_code or filename in event key");
  const match = fileName.match(/(\d+)/g);
  if (!match || !match[0])
    throw new Error("File name doesn't match required format, eg. 'page1.jpg'");
  const pageNumber = match[0];
  const details = { bucket, key, historyCode, fileName, pageNumber };
  console.log(details);
  return details;
};

const saveDataToS3Json = async (key: string, body: unknown) => {
  const params = {
    Bucket: process.env.TEXTRACT_BUCKET_NAME,
    Key: key,
    Body: JSON.stringify(body, null, 2),
  };
  const command = new PutObjectCommand(params);
  const data = await s3Client.send(command);
  return data;
};

const analyzeDocumentForTables = async (
  bucket: string,
  key: string,
): Promise<AnalyzeDocumentCommandOutput> => {
  const params: AnalyzeDocumentCommandInput = {
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

// TODO: define return type
const parseRentHistoryTables = (
  textractResponse: ApiAnalyzeDocumentResponse,
) => {
  const doc = new TextractDocument(textractResponse);
  const page = doc.pageNumber(1);

  const parsedTables = [];
  for (const table of page.iterTables()) {
    parsedTables.push(parseTable(table));
  }
  return parsedTables;
};

// TODO: define return type
const parseTable = (table: TableGeneric<Page>) => {
  const tableContents = [];
  for (const row of table.iterRows()) {
    const rowContents = [];
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

export const handler: Handler = async (event: S3Event, context: Context) => {
  console.log(
    "Lambda function started with event and context:",
    JSON.stringify(event, null, 2),
    JSON.stringify(context, null, 2),
  );

  const { bucket, key, historyCode, pageNumber } = getS3ObjectDetails(event);

  const textractResponse = await analyzeDocumentForTables(bucket, key);
  // parser has different type definitions from textract
  const rentHistoryTables = parseRentHistoryTables(
    textractResponse as ApiAnalyzeDocumentResponse,
  );

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
