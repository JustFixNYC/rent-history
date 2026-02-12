import * as fs from "fs";
import * as path from "path";
import type { TextractRentHistoryPage } from "./types";
import { RhTable } from "./standardize";

// function getDirectories(dirPath: string) {
//   return fs.readdirSync(dirPath).filter(function (file) {
//     return fs.statSync(path.join(dirPath, file)).isDirectory();
//   });
// }

const textractDir = path.resolve(process.cwd(), "test-textract");
const standardizeDir = path.resolve(process.cwd(), "test-standardize");

const HISTORY_CODE = "2026-02-02T15-53-14-822Z";
const FILE_NAME = "page3.json";

// const rhDirs = getDirectories(textractDir);

// console.log(rhDirs);

// rhDirs.forEach((rhDir) => {
//   const textractFiles = fs.readdirSync(path.join(textractDir, rhDir));
//   textractFiles.forEach((file) => {
//     const textractPath = path.join(textractDir, rhDir, file);
//     console.log(textractPath)
//     const rawData = fs.readFileSync(textractPath, "utf8");
//     const textractData: TextractRentHistoryPage = JSON.parse(rawData);
//     const parsedTable = new RhTable(textractData);
//     const standardizeRhDir = path.join(standardizeDir, rhDir);
//     fs.mkdirSync(standardizeRhDir, { recursive: true });
//     const standardizeFile = path.join(standardizeDir, file);
//     fs.writeFileSync(standardizeFile, JSON.stringify(parsedTable.cleanTable));
//   });
// });

const inputFile = path.join(textractDir, HISTORY_CODE, FILE_NAME);
const rawData = fs.readFileSync(inputFile, "utf8");
const textractData: TextractRentHistoryPage = JSON.parse(rawData);
const parsedTable = new RhTable(textractData);
const parsedTableJson = JSON.stringify(parsedTable.cleanTable, null, 2);
const standardizeRhDir = path.join(standardizeDir, HISTORY_CODE);
fs.mkdirSync(standardizeRhDir, { recursive: true });
const outputFile = path.join(standardizeDir, FILE_NAME);
fs.writeFileSync(outputFile, parsedTableJson);
