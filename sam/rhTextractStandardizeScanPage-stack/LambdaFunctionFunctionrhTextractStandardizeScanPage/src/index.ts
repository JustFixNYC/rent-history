import {
  TextractClient,
  AnalyzeDocumentCommand,
  type AnalyzeDocumentCommandInput,
  type AnalyzeDocumentCommandOutput,
} from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  ApiBlockType,
  Page,
  TextractDocument,
  type ApiAnalyzeDocumentResponse,
} from "amazon-textract-response-parser";
import type { S3Event, Context, Handler } from "aws-lambda";
import type { TableGeneric } from "amazon-textract-response-parser/dist/types/table";
import * as path from "path";

const config = { region: "us-east-1" };
const textractClient = new TextractClient(config);
const s3Client = new S3Client(config);

const getS3ObjectDetails = (event: S3Event) => {
  if (!event["Records"][0]) throw new Error("No record in event");
  const bucket = event["Records"][0]!["s3"]["bucket"]["name"];
  const key = event["Records"][0]!["s3"]["object"]["key"];
  const fileName = path.basename(key);
  const dirName = path.dirname(key);
  const historyCode = path.basename(dirName);
  if (!historyCode || !fileName)
    throw new Error("No history_code or filename in event key");
  const match = fileName.match(/(\d+)/g);
  if (!match || !match[0])
    throw new Error("File name doesn't match required format, eg. 'page1.jpg'");
  const pageNumber = match[0];
  const details = { bucket, key, dirName, historyCode, fileName, pageNumber };
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
    FeatureTypes: ["TABLES", "LAYOUT"],
  };

  try {
    const command = new AnalyzeDocumentCommand(params);
    const data = await textractClient.send(command);
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

  // Extract the results form 3 different methods
  const textLines = [];
  for (const line of page.iterLines()) {
    const lineData = [];
    for (const word of line.iterWords()) {
      lineData.push(word.text);
    }
    textLines.push(lineData);
  }

  const layoutLines = [];
  for (const layoutTable of page.layout.iterItems({
    includeBlockTypes: [ApiBlockType.LayoutTable],
  })) {
    for (const line of layoutTable.iterTextLines()) {
      // const words = line.listWords().map((word) => word.text)
      layoutLines.push(line.text);
    }
  }

  const parsedTables = [];
  for (const table of page.iterTables()) {
    parsedTables.push(parseTable(table));
  }
  return { parsedTables, layoutLines, textLines };
};

const parseTable = (table: TableGeneric<Page>) => {
  const tableContents = [];
  for (const row of table.iterRows({
    repeatMultiRowCells: true,
    ignoreMerged: true,
  })) {
    const rowContents = [];
    for (const cell of row.iterCells()) {
      const { columnSpan, rowSpan, text, confidence } = cell;
      const cellData = {
        columnSpan,
        rowSpan,
        text,
        confidence,
        ocrConfidence: cell.getOcrConfidence(),
      };
      rowContents.push(cellData);
    }
    const rowData = {
      rowConfidence: row.getConfidence(),
      rowOcrConfidence: row.getOcrConfidence(),
      rowContents,
    };
    tableContents.push(rowData);
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

  const { bucket, key, dirName, historyCode, pageNumber } =
    getS3ObjectDetails(event);

  const textractResponse = await analyzeDocumentForTables(bucket, key);
  // parser has different type definitions from textract
  const rentHistoryTables = parseRentHistoryTables(
    textractResponse as ApiAnalyzeDocumentResponse,
  );

  const jsonKey = `${dirName}/page${pageNumber}.json`;
  const rentHistoryTablesJson = await saveDataToS3Json(
    jsonKey,
    rentHistoryTables,
  );

  await saveDataToS3Json(
    `${dirName}/textract_page${pageNumber}.json`,
    textractResponse,
  );

  console.log(historyCode);
  console.log(rentHistoryTablesJson);

  const response = {
    statusCode: 200,
    body: JSON.stringify("Tables extracted from rent history scans"),
  };
  return response;
};
