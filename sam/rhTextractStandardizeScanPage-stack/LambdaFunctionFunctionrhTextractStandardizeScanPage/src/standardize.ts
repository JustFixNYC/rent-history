import * as fs from "fs";
import * as path from "path";



type Cell = {
  left: number;
  width: number;
  text: string;
  confidence: number;
  ocrConfidence: number;
};
type Row = {
  rowConfidence: number;
  rowOcrConfidence: number;
  rowContents: Cell[];
};
type Table = {
  tableConfidence: number;
  tableType: string;
  tableContentsConfidence: number;
  tableContents: Row[];
};
type Line = {
  left: number;
  vCenter: number;
  text: string;
};
type ParsedTextractOutput = {
  tables: Table[];
  lines: Line[];
};

// function getDirectories(dirPath: string) {
//   return fs.readdirSync(dirPath).filter(function (file) {
//     return fs.statSync(path.join(dirPath, file)).isDirectory();
//   });
// }

const RH_FILE = path.join(process.cwd(), "test-textract/2026-02-02T15-53-14-822Z/page3.json")

// console.log(process.cwd());
// const dataDir = path.resolve(process.cwd(), "../test-textract");
// const rhDirs = getDirectories(dataDir);

const rawData = fs.readFileSync(RH_FILE, "utf8");
const jsonData: ParsedTextractOutput = JSON.parse(rawData);


const { tables, lines } = jsonData;

type ParsedFields = {
  regYear: string;
  hasI: string;
  aptStat: string;
  filingDate: string;
  legalRent: string;
  tenant: string;
};

class RsRowParser {
  public row: string;
  public fields: ParsedFields;

  constructor(row: string) {
    this.row = row;
    this.fields = {
      regYear: "",
      hasI: "",
      aptStat: "",
      filingDate: "",
      legalRent: "",
      tenant: "",
    };
  }

  updateRow(regex: RegExp): void {
    this.row = this.row.replace(regex, "").trim();
  }
  // TODO: any other possible formats for "I"?
  parseRegYear(): void {
    if (!this.row) return;
    const regex = /(\d+)[\s\-(]*(I)?/;
    const match = this.row.match(regex);
    // console.log(match)
    if (!match) return;
    this.fields.regYear = match[1] || "";
    this.fields.hasI = (!!match[2]).toString();
    this.updateRow(regex);
  }

  // TODO: any other possible values?
  parseAptStat(): void {
    if (!this.row) return;
    const regex = /(RS|VA)/;
    const match = this.row.match(regex);
    // console.log(match);
    if (!match) return;
    this.fields.aptStat = match[1] || "";
    this.updateRow(regex);
  }

  // TODO: any other possible values?
  parseFilingDate(): void {
    if (!this.row) return;
    const regex = /(NC|\d{2}\/\d{2}\/\d{4})/;
    const match = this.row.match(regex);
    // console.log(match);
    if (!match || !match[1]) return;
    if (match[1] === "NC") {
      this.fields.filingDate = match[1];
    } else {
      const [month, day, year] = match[1].split("/");
      if (!month || !day || !year) return;
      // The Date constructor expects the month to be zero-based (January = 0, etc.)
      const filingDate = new Date(+year, +month - 1, +day);
      this.fields.filingDate = filingDate.toISOString().slice(0, 10);
    }
    this.updateRow(regex);
  }

  // TODO: this likely needs to be last since it's the least structured and the
  // name(s) often get separated and grouped with other values in Textract's
  // cell splitting. also need to decide if we need this at all for analysis and
  // how to store multiple names or non-name values
  parseTenant(): void {
    if (!this.row) return;
    const regex = /(TENANT:\s*(\b[^\d\W]+\b\s*)+)/;
    const match = this.row.match(regex);
    // console.log(match);
    if (!match) return;
    this.fields.tenant = match[1] || "";
    this.updateRow(regex);
  }

  // TODO:
  parseLegalRent(): void {
    if (!this.row) return;
    const regex = /^(\d+.\d{2})\b/;
    const match = this.row.match(regex);
    // console.log(match);
    if (!match) return;
    this.fields.legalRent = match[1] || "";
    this.updateRow(regex);
  }
}

const cleanRows = tables[0]!.tableContents
  // remove header rows
  .filter(
    (row) =>
      !!row.rowContents[0] && !row.rowContents[0].text.match(/^(reg)|(year)/i),
  )
  .map((row) => {
    console.log(row);
    const rowJoined = row.rowContents.map((cell) => cell.text).join(" ");

    const rowParser = new RsRowParser(rowJoined);

    rowParser.parseRegYear();
    rowParser.parseAptStat();
    rowParser.parseFilingDate();
    rowParser.parseLegalRent();

    return rowParser.fields;
  });

console.log(cleanRows);


const parsedLines: Line[][] = [];

lines.forEach((segment, index, arr) => {
  const prevSegment = arr[index - 1];
  
  if (!!prevSegment && segment.left > prevSegment.left) {
    parsedLines.at(-1)?.push(segment)
  } else {
    parsedLines.push([segment])
  }
})

console.log(parsedLines)
