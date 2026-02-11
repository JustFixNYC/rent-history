import * as fs from "fs";
import * as path from "path";
import type { ParsedRentHistoryPage as TextractRentHistoryPage, Word } from ".";

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
};
type CleanTable = CleanRow[];

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
};

class RhTable {
  textractOutput: TextractRentHistoryPage;
  columnPositions: ColumnPosition[];
  orientation: number | undefined;
  // TODO: consider adjusting tolerance based on page orientation (overkill?)
  /** Tolerance for comparing positions of page elements (eg. line segment alignment with columns) */
  tolerance = 0.01;
  cleanTable: CleanTable = [];
  regexDate = /\d{2}\/\d{2}\/\d{4}/;
  regexRent = /(?:\d{4}W?)|(?:EXEMPT)|(?:AMT MISS)/;
  regexFullRowStat = /(?:REG NOT REQUIRED)|(?:REG NOT FOUND)/;

  constructor(textractOutput: TextractRentHistoryPage) {
    this.textractOutput = textractOutput;
    this.columnPositions = this.getColumnPositions();
    this.orientation = textractOutput.pageOrientationDegrees;
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

  /**
   * Look through lines of the page and identify each row with a registration
   * year and create the rows of the clean table with each year
   */
  parseRegYear(): void {
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

  toDateString(x: string): string | undefined {
    const [month, day, year] = x.split("/");
    if (!month || !day || !year) return;
    // The Date constructor expects the month to be zero-based (January = 0, etc.)
    const date = new Date(+year, +month - 1, +day);
    return date.toISOString().slice(0, 10);
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

  parseAptStat(): void {
    this.forEachYearRowLine((row, line) => {
      const joinedWordsNoYear = this.joinWords(line.slice(1), " ");
      const match = joinedWordsNoYear.match(this.regexFullRowStat);
      if (match) {
        row.aptStat = { value: joinedWordsNoYear, flag: false };
        row._isFullRowStat = true;
        return;
      }
      const words = line.filter((word) =>
        this.isWithin(word, this.columnPositions[1]!),
      );
      if (!words) return;
      const aptStat = this.joinWords(words, " ");
      row.aptStat = { value: aptStat, flag: false };
    });
  }

  parseAll(): void {
    this.parseRegYear();
    this.parseAptStat();
    this.parseRents();
    this.parseLeaseStart();
    this.parseFilingDate();
  }
}

const rhTable = new RhTable(rhPageTextractData);

rhTable.parseAll();
console.log(rhTable.cleanTable);
