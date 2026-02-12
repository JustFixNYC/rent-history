import * as fs from "fs";
import * as path from "path";
import type {
  TextractLines,
  ParsedRentHistoryPage as TextractRentHistoryPage,
  TextractTable,
  Word,
} from ".";

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

type ColumnPosition = { left: number; right: number };

// TODO: consider flagging only at row level
type CleanCell = {
  value: string | number | string[] | undefined;
  flag: boolean;
};
type CleanRow = {
  regYear: CleanCell;
  aptStat: CleanCell;
  filingDate: CleanCell;
  legalRent: CleanCell;
  prefRent: CleanCell;
  paidRent: CleanCell;
  reasons: CleanCell;
  leaseStart: CleanCell;
  leaseEnd: CleanCell;
  tenantName: CleanCell;
  _isFullRowStat: boolean;
  _lineIndexes: number[];
  _flagForReview: boolean;
};
type CleanTable = CleanRow[];

type CleanRow2 = {
  regYear: string | undefined;
  aptStat: string | undefined;
  filingDate: string | undefined;
  legalRent: string | undefined;
  prefRent: string | undefined;
  paidRent: string | undefined;
  reasons: string | undefined;
  leaseStart: string | undefined;
  leaseEnd: string | undefined;
  tenantName: string | undefined;
  _isFullRowStat: boolean;
  _lineIndexes: number[];
  _flagForReview: boolean;
};
type CleanTable2 = CleanRow2[];

const defaultRow2: CleanRow2 = {
  regYear: undefined,
  aptStat: undefined,
  filingDate: undefined,
  legalRent: undefined,
  prefRent: undefined,
  paidRent: undefined,
  reasons: undefined,
  leaseStart: undefined,
  leaseEnd: undefined,
  tenantName: undefined,
  _isFullRowStat: false,
  _lineIndexes: [],
  _flagForReview: false,
};
const defaultCell: CleanCell = {
  value: undefined,
  flag: false,
};
const defaultRow: CleanRow = {
  regYear: defaultCell,
  aptStat: defaultCell,
  filingDate: defaultCell,
  legalRent: defaultCell,
  prefRent: defaultCell,
  paidRent: defaultCell,
  reasons: defaultCell,
  leaseStart: defaultCell,
  leaseEnd: defaultCell,
  tenantName: defaultCell,
  _isFullRowStat: false,
  _lineIndexes: [],
  _flagForReview: false,
};

class RhTable {
  textractOutput: TextractRentHistoryPage;
  textractLines: TextractLines;
  textractTables: TextractTable[];
  columnPositions: ColumnPosition[];
  orientation: number | undefined;
  // TODO: consider adjusting tolerance based on page orientation (overkill?)
  /** Tolerance for comparing positions of page elements (eg. line segment alignment with columns) */
  tolerance = 0.01;
  cleanTable: CleanTable = [];
  cleanTable2: CleanTable2 = [];
  regexDate = /\d{2}\/\d{2}\/\d{4}/;
  regexRent = /(?:\d{4}W?)|(?:EXEMPT)|(?:AMT MISS)/;
  regexFullRowStat = /(?:REG NOT REQUIRED)|(?:REG NOT FOUND)/;
  // possible first word of line after bottom of table
  regexAfterTableWord = /(?:Advisory)|(?:APARTMENT)/;

  constructor(textractOutput: TextractRentHistoryPage) {
    this.textractOutput = textractOutput;
    this.textractLines = textractOutput.lines;
    this.textractTables = textractOutput.tables;
    this.columnPositions = this.getColumnPositions();
    this.orientation = textractOutput.pageOrientationDegrees;
  }

  /**
   * Look through lines of the page and identify each row with a registration
   * year and create the rows of the clean table with each year
   */
  setRegYearRows(): void {
    this.textractOutput.lines.forEach((line) => {
      const match = line[0]?.text.match(/^\d{4}/);
      if (match) {
        const row = {
          ...defaultRow,
          regYear: { value: match[0], flag: false },
        };
        this.cleanTable.push(row);
      }
    });
  }

  initializeCleanRows(): void {
    // first search for line "REGISTRATION APARTMENT INFORMATION", then look below there. Otherwise looking just for a first word with \d{4} could get subject premises address line
    const preTableLineIndex = this.textractLines.findIndex((line) =>
      this.joinWords(line, " ").match("REGISTRATION APARTMENT INFORMATION"),
    );
    let lineIndex: number = preTableLineIndex + 1;
    while (lineIndex <= this.textractLines.length) {
      const firstWord = this.textractLines[lineIndex]?.at(0)?.text;
      if (!firstWord) {
        lineIndex++;
        continue;
      }

      const yearMatch = firstWord.match(/\d{4}/);
      if (yearMatch) {
        const newRow = {
          ...defaultRow2,
          regYear: yearMatch[0],
          _lineIndexes: [lineIndex],
        };
        this.cleanTable2.push(newRow);
        lineIndex++;
        continue;
      }

      if (!this.cleanTable2.length) {
        lineIndex++;
        continue;
      }

      const afterTableMatch = firstWord.match(this.regexAfterTableWord);
      if (afterTableMatch) {
        console.log("after table match");
        break;
      }

      this.cleanTable2.at(-1)?._lineIndexes.push(lineIndex);
      lineIndex++;
    }
  }

  // TODO: this should probably be combined with setting reg year rows
  getRowLineIndexes(): void {
    this.cleanTable.forEach((row) => {
      const lines = this.textractOutput.lines;
      const lineIndexes: number[] = [];
      const firstLineIndex = lines.findIndex((line) =>
        line[0]?.text.startsWith(row.regYear.value as string),
      );
      lineIndexes.push(firstLineIndex);
      let i: number = firstLineIndex + 1;
      while (i <= lines.length) {
        const firstWord = lines[i]?.[0]?.text;
        if (
          !firstWord ||
          firstWord.match(/\d{4}/) ||
          firstWord.match(this.regexAfterTableWord)
        ) {
          break;
        }
        lineIndexes.push(i);
        i++;
      }
      row._lineIndexes = lineIndexes;
    });
  }

  forEachRow(callbackfn: (row: CleanRow, lines: Word[][]) => void): void {
    this.cleanTable.forEach((row) => {
      const lines = row._lineIndexes
        .map((index) => this.textractOutput.lines[index])
        .filter((line): line is Word[] => line !== undefined);

      // Shouldn't be possible, since needed to have a line to create the row
      if (!lines) return;

      callbackfn(row, lines);
    });
  }

  parseAptStat(): void {
    this.cleanTable.forEach((row) => {
      const firstLineIndex = row._lineIndexes.at(0);
      if (!firstLineIndex) return;
      const firstLine = this.textractOutput.lines.at(firstLineIndex);
      if (!firstLine) return;

      const joinedWordsNoYear = this.joinWords(firstLine.slice(1), " ");
      const match = joinedWordsNoYear.match(this.regexFullRowStat);
      if (match) {
        row.aptStat = { value: joinedWordsNoYear, flag: false };
        row._isFullRowStat = true;
        return;
      }
      const words = firstLine.filter((word) =>
        this.isWithin(word, this.columnPositions[1]!),
      );
      if (!words) return;
      const aptStat = this.joinWords(words, " ");
      row.aptStat = { value: aptStat, flag: false };
    });
  }
  // parseAptStat(): void {
  //   this.forEachYearRowLine((row, line) => {
  //     const joinedWordsNoYear = this.joinWords(line.slice(1), " ");
  //     const match = joinedWordsNoYear.match(this.regexFullRowStat);
  //     if (match) {
  //       row.aptStat = { value: joinedWordsNoYear, flag: false };
  //       row._isFullRowStat = true;
  //       return;
  //     }
  //     const words = line.filter((word) =>
  //       this.isWithin(word, this.columnPositions[1]!),
  //     );
  //     if (!words) return;
  //     const aptStat = this.joinWords(words, " ");
  //     row.aptStat = { value: aptStat, flag: false };
  //   });
  // }

  /**
   * Updates the rows in the clean table of results with all three rent fields
   * (must have already been initialized with rows from parseRegYear). First the
   * rent values from the line are identified with regex and then they are
   * assigned to the three rent columns based on the geometry data for the
   * columns and the words (rents), since they can appear in any combination
   * with missing values.
   */
  parseRents(): void {
    this.forEachYearRowLine((row, line) => {
      const rents = line?.filter((word) => word.text.match(this.regexRent));
      if (!rents) return;

      rents.forEach((rent) => {
        if (this.isWithin(rent, this.columnPositions[3]!)) {
          row.legalRent = { value: rent.text, flag: false };
        } else if (this.isWithin(rent, this.columnPositions[4]!)) {
          row.prefRent = { value: rent.text, flag: false };
        } else if (this.isWithin(rent, this.columnPositions[5]!)) {
          row.paidRent = { value: rent.text, flag: false };
        }
      });
    });
  }

  parseFilingDate(): void {
    this.forEachYearRowLine((row, line) => {
      const firstDate = line.find((word) => word.text.match(this.regexDate));
      if (!!firstDate && this.isWithin(firstDate, this.columnPositions[2]!)) {
        const match = firstDate?.text.match(this.regexDate);
        if (!match) return;
        const date = this.toDateString(match[0]);
        row.filingDate = { value: date, flag: false };
      }
    });
  }

  parseLeaseStart(): void {
    this.forEachYearRowLine((row, line) => {
      const lastWord = line.at(-1);
      const match = lastWord?.text.match(this.regexDate);
      if (!match) return;
      const date = this.toDateString(match[0]);
      row.leaseStart = { value: date, flag: false };
    });
  }

  /**
   * Iterate through rows in the clean table of results for each registration
   * year and calls the callbackfn for that clean row and line of the textract
   * results (array of words). This allows for parsing fields from the textract
   * line and updating the clean row with the new values.
   *
   * @param callbackfn A function that accepts arguments for a row in the clean
   * table of results and a corresponding line (array of words) from textract.
   * forEachYearRowLine calls the callbackfn function one time for each
   * registration year's row in the clean table.
   * @param skipFullStatRows Whether to skip rows with a "apt stat" value the
   * cover the whole row (eg. *EXEMPT APARTMENT - REG NOT REQUIRED*). Defaults
   * to true. This option is only available once parseAptStat has been run to
   * identify these rows.
   */
  forEachYearRowLine(
    callbackfn: (row: CleanRow, line: Word[]) => void,
    skipFullStatRows: boolean = true,
  ): void {
    this.cleanTable.forEach((row) => {
      if (skipFullStatRows && row._isFullRowStat) return;
      const line = this.textractOutput.lines.find((line) =>
        line[0]?.text.startsWith(row.regYear.value as string),
      );
      if (!line) return;
      callbackfn(row, line);
    });
  }

  getColumnPositions(): ColumnPosition[] {
    // TODO handle multiple tables on page, first page, split header row, ensure 8 cells
    const headerCells = this.textractOutput.tables[0]!.rows[0]!.cells;
    return headerCells.map(({ left, right }) => ({ left, right }));
  }

  joinWords(line: Word[], separator: string | undefined): string {
    return line.map((word) => word.text).join(separator);
  }

  isWithin(segment: Word, column: ColumnPosition): boolean {
    return (
      segment.left >= column.left - this.tolerance &&
      segment.right <= column.right + this.tolerance
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
    this.setRegYearRows();
    this.getRowLineIndexes();
    this.parseAptStat();
    this.parseRents();
    this.parseLeaseStart();
    this.parseFilingDate();
  }
}

const rhTable = new RhTable(rhPageTextractData);

// rhTable.parseAll();
rhTable.initializeCleanRows();
console.log(rhTable.cleanTable2);
