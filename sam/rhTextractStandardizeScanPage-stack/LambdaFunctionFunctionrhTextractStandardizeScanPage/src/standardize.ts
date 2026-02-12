import * as fs from "fs";
import * as path from "path";
import type {
  CleanRow,
  CleanTable,
  ColumnPosition,
  TextractLines,
  TextractRentHistoryPage,
  TextractTable,
  Word,
} from "./types";

// function getDirectories(dirPath: string) {
//   return fs.readdirSync(dirPath).filter(function (file) {
//     return fs.statSync(path.join(dirPath, file)).isDirectory();
//   });
// }

const RH_FILE = path.join(
  process.cwd(),
  "test-textract/2026-02-02T15-53-14-822Z/page3.json",
);

// console.log(process.cwd());
// const dataDir = path.resolve(process.cwd(), "../test-textract");
// const rhDirs = getDirectories(dataDir);

const rawData = fs.readFileSync(RH_FILE, "utf8");
const rhPageTextractData: TextractRentHistoryPage = JSON.parse(rawData);

const defaultRow: CleanRow = {
  regYear: undefined,
  aptStat: undefined,
  filingDate: undefined,
  legalRent: undefined,
  prefRent: undefined,
  paidRent: undefined,
  reasons: [],
  leaseStart: undefined,
  leaseEnd: undefined,
  tenants: [],
  _isFullRowStat: false,
  _lineIndexes: [],
  _flagForReview: false,
};

class RhTable {
  textractLines: TextractLines;
  textractTables: TextractTable[];
  columnPositions: ColumnPosition[];
  orientation: number | undefined;
  cleanTable: CleanTable = [];
  scanQuality: number;
  // TODO: consider adjusting tolerance based on page orientation (overkill?)
  /** Tolerance for checking if word falls between column borders */
  tolerance = 0.01;
  regexDate = /\d{2}\/\d{2}\/\d{4}/;
  regexRent = /(?:\d+\.\d{2}W?)|(?:EXEMPT)|(?:AMT MISS)/;
  regexFullRowStat = /(?:REG NOT REQUIRED)|(?:REG NOT FOUND)/;
  // possible first word of line after bottom of table
  regexAfterTableWord = /(?:Advisory)|(?:APARTMENT)/;

  constructor(textractOutput: TextractRentHistoryPage) {
    this.textractLines = textractOutput.lines;
    this.textractTables = textractOutput.tables;
    this.orientation = textractOutput.pageOrientationDegrees;
    this.columnPositions = this.getColumnPositions();
    this.parseAll();
    this.scanQuality = this.getScanQuality();
  }

  initializeCleanRows(): void {
    const lines = this.textractLines;
    // first search for line "REGISTRATION APARTMENT INFORMATION", then look below there. Otherwise looking just for a first word with \d{4} could get subject premises address line
    const preTableLineIndex = lines.findIndex((line) =>
      this.joinWords(line, " ").match("REGISTRATION APARTMENT INFORMATION"),
    );
    let lineIndex: number = preTableLineIndex + 1;
    while (lineIndex <= lines.length) {
      const firstWord = lines[lineIndex]?.at(0)?.text;
      if (!firstWord) {
        lineIndex++;
        continue;
      }

      const yearMatch = firstWord.match(/\d{4}/);
      if (yearMatch) {
        const newRow = {
          ...defaultRow,
          regYear: yearMatch[0],
          _lineIndexes: [lineIndex],
        };
        this.cleanTable.push(newRow);
      } else if (firstWord.match(this.regexAfterTableWord)) {
        break;
      } else {
        this.cleanTable.at(-1)?._lineIndexes.push(lineIndex);
      }

      lineIndex++;
    }
  }

  forEachRow(callbackfn: (row: CleanRow, lines: Word[][]) => void): void {
    this.cleanTable.forEach((row) => {
      const lines = row._lineIndexes
        .map((index) => this.textractLines[index])
        .filter((line): line is Word[] => line !== undefined);

      // Shouldn't be possible, since needed to have a line to create the row
      if (!lines) return;

      callbackfn(row, lines);
    });
  }

  parseAptStat(row: CleanRow, lines: Word[][]): void {
    const firstLine = lines.at(0)!;
    const joinedWordsNoYear = this.joinWords(firstLine.slice(1), " ");
    const match = joinedWordsNoYear.match(this.regexFullRowStat);
    if (match) {
      row.aptStat = joinedWordsNoYear;
      row._isFullRowStat = true;
      return;
    }
    const words = firstLine.filter((word) =>
      this.isWithin(word, this.columnPositions[1]!),
    );
    if (!words) return;
    const aptStat = this.joinWords(words, " ");
    row.aptStat = aptStat;
  }

  parseFilingDate(row: CleanRow, lines: Word[][]): void {
    const firstLine = lines.at(0)!;
    const firstDate = firstLine.find((word) => word.text.match(this.regexDate));
    if (!!firstDate && this.isWithin(firstDate, this.columnPositions[2]!)) {
      const match = firstDate?.text.match(this.regexDate);
      if (!match) return;
      row.filingDate = this.toDateString(match[0]);
    }
  }

  parseRents(row: CleanRow, lines: Word[][]): void {
    const firstLine = lines.at(0)!;
    const rents = firstLine?.filter((word) => word.text.match(this.regexRent));
    if (!rents) return;

    rents.forEach((rent) => {
      if (this.isWithin(rent, this.columnPositions[3]!)) {
        row.legalRent = rent.text;
      } else if (this.isWithin(rent, this.columnPositions[4]!)) {
        row.prefRent = rent.text;
      } else if (this.isWithin(rent, this.columnPositions[5]!)) {
        row.paidRent = rent.text;
      }
    });
  }

  parseReasons(row: CleanRow, lines: Word[][]): void {
    const reasons = lines
      .map((line) => {
        const words = line.filter((word) =>
          this.isWithin(word, this.columnPositions[6]!),
        );
        if (!words.length) return;
        return this.joinWords(words, " ");
      })
      .filter((reason) => reason !== undefined);
    if (reasons) {
      row.reasons = reasons;
    }
  }

  parseLeaseStart(row: CleanRow, lines: Word[][]): void {
    const firstLine = lines.at(0)!;
    const lastWord = firstLine.at(-1);
    const match = lastWord?.text.match(this.regexDate);
    if (!match) return;
    row.leaseStart = this.toDateString(match[0]);
  }

  parseLeaseEnd(row: CleanRow, lines: Word[][]): void {
    const secondLine = lines.at(1);
    const lastWord = secondLine?.at(-1);
    const match = lastWord?.text.match(this.regexDate);
    if (!match) return;
    row.leaseEnd = this.toDateString(match[0]);
  }

  // TODO: do we need to differentiate tenant names from other values?
  parseTenants(row: CleanRow, lines: Word[][]): void {
    const tenants = lines
      .slice(1)
      .map((line) => {
        const words = line.filter(
          (word) =>
            !word.text.match(this.regexDate) && !word.text.match(/TENANT./),
        );
        if (!words.length) return;
        return this.joinWords(words, " ");
      })
      .filter((tenant) => tenant !== undefined);
    if (tenants) {
      row.tenants = tenants;
    }
  }

  parseFields(): void {
    this.forEachRow((row, lines) => {
      this.parseAptStat(row, lines);
      this.parseFilingDate(row, lines);
      this.parseRents(row, lines);
      this.parseReasons(row, lines);
      this.parseLeaseStart(row, lines);
      this.parseLeaseEnd(row, lines);
      this.parseTenants(row, lines);
    });
  }

  getColumnPositions(): ColumnPosition[] {
    // TODO handle multiple tables on page, first page, split header row, ensure 8 cells
    const headerCells = this.textractTables[0]!.rows[0]!.cells;
    return headerCells.map(({ left, right }) => ({ left, right }));
  }

  joinWords(line: Word[], separator: string | undefined): string {
    return line.map((word) => word.text).join(separator);
  }

  isWithin(word: Word, column: ColumnPosition): boolean {
    return (
      word.left >= column.left - this.tolerance &&
      word.right <= column.right + this.tolerance
    );
  }

  toDateString(x: string): string | undefined {
    const [month, day, year] = x.split("/");
    if (!month || !day || !year) return;
    // The Date constructor expects the month to be zero-based (January = 0, etc.)
    const date = new Date(+year, +month - 1, +day);
    return date.toISOString().slice(0, 10);
  }

  parseAll(): void {
    this.initializeCleanRows();
    this.parseFields();
  }

  getScanQuality(): number {
    // TODO: evaluate scan based on combination of ocrConfidence scores, and completeness of parsed data
    return 1;
  }
}

const rhTable = new RhTable(rhPageTextractData);

console.log(rhTable.cleanTable);
