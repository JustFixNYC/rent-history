import * as fs from "fs";
import * as path from "path";

function getDirectories(dirPath: string) {
  return fs.readdirSync(dirPath).filter(function (file) {
    return fs.statSync(path.join(dirPath, file)).isDirectory();
  });
}

console.log(process.cwd());
const dataDir = path.resolve(process.cwd(), "../test-data");
const rhDirs = getDirectories(dataDir);

const pageFile = path.join(dataDir, rhDirs[0]!, "page2.json");
const rawData = fs.readFileSync(pageFile, "utf8");
const jsonData = JSON.parse(rawData)[0];

const table: string[][] = jsonData.tableContents;

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

const cleanRows = table
  // remove header rows
  .filter((row) => !!row[0] && !row[0].match(/^(reg)|(year)/i))
  .map((row) => {
    console.log(row);
    const rowJoined = row.join(" ");

    const rowParser = new RsRowParser(rowJoined);

    rowParser.parseRegYear();
    rowParser.parseAptStat();
    rowParser.parseFilingDate();
    rowParser.parseLegalRent();

    return rowParser.fields;
  });

console.log(cleanRows);
