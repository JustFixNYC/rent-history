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
};

class RhTable {
  textractOutput: TextractRentHistoryPage;
  columnPositions: ColumnPosition[];
  orientation: number | undefined;
  // TODO: consider adjusting tolerance based on page orientation (overkill?)
  /** Tolerance for comparing positions of page elements (eg. line segment alignment with columns) */
  tolerance = 0.01;
  cleanTable: CleanTable = [];

  constructor(textractOutput: TextractRentHistoryPage) {
    this.textractOutput = textractOutput;
    this.columnPositions = this.getColumnPositions();
    this.orientation = textractOutput.pageOrientationDegrees;
  }

  getColumnPositions(): ColumnPosition[] {
    // TODO handle multiple tables on page, first page, split header row
    const headerCells = this.textractOutput.tables[0]!.rows[0]!.cells;
    return headerCells.map(({ left, right }) => ({ left, right }));
  }

  getLineJoined(line: Word[], separator: string | undefined): string {
    return line.map((segment) => segment.text).join(separator);
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
   */
  forEachYearRowLine(callbackfn: (row: CleanRow, line: Word[]) => void): void {
    this.cleanTable.forEach((row) => {
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
      const rents = line?.filter((word) => word.text.match(/\d+\.\d{2}/));
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
      const match = lastWord?.text.match(/\d{2}\/\d{2}\/\d{4}/);
      if (!match) return;
      const date = this.toDateString(match[0]);
      row.leaseStart = { value: date, flag: false };
    });
  }
}

const rhTable = new RhTable(rhPageTextractData);

rhTable.parseRegYear();
rhTable.parseRents();
rhTable.parseLeaseStart();
console.log(rhTable.cleanTable);
