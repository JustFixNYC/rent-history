import type {
  CleanRow,
  CleanTable,
  ColumnPosition,
  TextractLines,
  TextractRentHistoryPage,
  TextractTable,
  Word,
} from "./types";

const DEFAULT_ROW: CleanRow = {
  regYear: null,
  regType: null,
  aptStat: null,
  filingDate: null,
  legalRent: null,
  legalRentText: null,
  prefRent: null,
  prefRentText: null,
  paidRent: null,
  paidRentText: null,
  reasons: [],
  leaseStart: null,
  leaseEnd: null,
  tenants: [],
  sublines: [],
  _isFullRowStat: false,
  _lineIndexes: [],
  _flagForReview: false,
};

export class RhTable {
  textractLines: TextractLines;
  textractTables: TextractTable[];
  columnPositions: ColumnPosition[];
  orientation: number | undefined;
  ocrConfidence: number | undefined;
  cleanTable: CleanTable = [];
  // Whether we need the user to re-scan hte page because the OCR confidence is too low and/or the page rotation is too extreme
  rescan: boolean;
  // The maximum allowable rotation of the scan image, beyond which we will request the user re-scan
  orientationThreshold = 0.1;
  // The minimum allowable OCR confidence for the overall page, beyond which we will request the user re-scan
  ocrConfidenceThreshold = 0.7;
  /** Tolerance for checking if word falls between column borders */
  tolerance = 0.02;
  regexDate = /\d{2}\/\d{2}\/\d{4}/;
  regexRent = /(?:(\d+\.\d{2})(W)?)|(\D+)/i;
  // regType (eg. "(I)") can appear within regYear or aptStat columns
  regexRegYearRegType = /(\d{4})[\s\-(]*([IAD])?/i;
  regexRegTypeAptStat = /\(?([IDA])?\)?\s*(.*)/i;
  regexFullRowStat = /(?:REG NOT REQUIRED)|(?:REG NOT FOUND)/i;
  // possible first word of line after bottom of table
  regexAfterTableLine = /(?:Advisory)|(?:APARTMENT)|(?:appended)/i;
  regexHeaders = [
    /^Reg\s*(?:Year)?$/i,
    /^Apt\s*(?:Stat)?$/i,
    /^Filing\s*(?:Date)?$/i,
    /^Legal\s*(?:Regulated)?\s*(?:Rent)?$/i,
    /^Prefer\.\s*(?:Rent)?$/i,
    /^Actual\s*(?:Rent)?\s*(?:Paid)?$/i,
    /^Reasons\s*(?:Differ\.\/)?\s*(?:Change)?$/i,
    /^Lease\s*(?:Began\/Ends)?$/i,
  ];
  regexAptStatFilingDate = /^Apt\s*Filing\s*Stat\s*Date$/i;

  constructor(textractOutput: TextractRentHistoryPage) {
    this.textractLines = textractOutput.lines;
    this.textractTables = textractOutput.tables;
    this.orientation = textractOutput.pageOrientationDegrees;
    this.ocrConfidence = textractOutput.tables[0].ocrConfidence;
    this.columnPositions = this.getColumnPositions();
    this.rescan = this.getRescan();
    this.parseAll();
  }

  initializeCleanRows(): void {
    const lines = this.textractLines;
    // first search for line "REGISTRATION APARTMENT INFORMATION", then look below there. Otherwise looking just for a first word with \d{4} could get subject premises address line
    const preTableLineIndex = lines.findIndex((line) =>
      this.joinWords(line, " ").match("REGISTRATION APARTMENT INFORMATION"),
    );
    let lineIndex: number = preTableLineIndex + 1;
    while (lineIndex <= lines.length) {
      const line = lines[lineIndex];
      const firstWord = line?.at(0)?.text;
      if (!firstWord) {
        lineIndex++;
        continue;
      }

      const match = firstWord.match(this.regexRegYearRegType);
      if (match) {
        const newRow = {
          ...DEFAULT_ROW,
          regYear: match[1],
          _lineIndexes: [lineIndex],
        };
        if (match[2]) {
          newRow["regType"] = match[2];
        }
        this.cleanTable.push(newRow);
      } else if (this.joinWords(line, " ").match(this.regexAfterTableLine)) {
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
    const firstLine = lines[0]!;
    const joinedWordsNoYear = this.joinWords(firstLine.slice(1), " ");
    const matchFullRow = joinedWordsNoYear.match(this.regexFullRowStat);
    if (matchFullRow) {
      row.aptStat = joinedWordsNoYear;
      row._isFullRowStat = true;
      return;
    }
    const words = firstLine.filter((word) =>
      this.isWithin(word, this.columnPositions[1]!),
    );
    if (!words) return;
    const aptStatWords = this.joinWords(words, " ");
    const matchAptStat = aptStatWords.match(this.regexRegTypeAptStat);
    if (matchAptStat) {
      row.regType = matchAptStat[1] || null;
      row.aptStat = matchAptStat[2];
    } else {
      row.aptStat = aptStatWords;
    }
  }

  // We dn't need to use filingDate, so may leave out of table later.
  parseFilingDate(row: CleanRow, lines: Word[][]): void {
    const firstLine = lines[0]!;
    // note this doesn't capture "NC" but that just means it's missing, so its ok.
    const firstDate = firstLine.find((word) => word.text.match(this.regexDate));
    if (!!firstDate && this.isWithin(firstDate, this.columnPositions[2]!)) {
      const match = firstDate?.text.match(this.regexDate);
      if (!match) return;
      row.filingDate = this.toDateString(match[0]);
    }
  }

  parseRents(row: CleanRow, lines: Word[][]): void {
    const firstLine = lines[0];
    const rentValues = this.columnPositions.slice(3, 6).map((colPos) => {
      const rentWords = firstLine.filter((word) => this.isWithin(word, colPos));
      const rentText = this.joinWords(rentWords, " ");
      const match = rentText.match(this.regexRent);
      const number = match?.[1] ? +match[1] : null;
      const text = match?.[2] ? match[2] : null;
      return { number, text };
    });
    row.legalRent = rentValues[0].number;
    row.legalRentText = rentValues[0].text;
    row.prefRent = rentValues[1].number;
    row.prefRentText = rentValues[1].text;
    row.paidRent = rentValues[2].number;
    row.paidRentText = rentValues[2].text;
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
    const firstLine = lines[0]!;
    const lastWord = firstLine.at(-1);
    const match = lastWord?.text.match(this.regexDate);
    if (!match) return;
    row.leaseStart = this.toDateString(match[0]);
  }

  parseLeaseEnd(row: CleanRow, lines: Word[][]): void {
    const secondLine = lines[1];
    const lastWord = secondLine?.at(-1);
    const match = lastWord?.text.match(this.regexDate);
    if (!match) return;
    row.leaseEnd = this.toDateString(match[0]);
  }

  parseTenants(row: CleanRow, lines: Word[][]): void {
    if (lines.length < 2) return;
    const hasTenants = !!this.joinWords(lines.at(1), " ").match(/TENANT/i);
    const sublineValues = lines
      .slice(1)
      .map((line) => {
        const words = line.filter(
          (word) =>
            this.isWithin(word, this.combinedColumns(1, 5)) &&
            !word.text.match(/TENANT./i),
        );
        if (!words.length) return;
        return this.joinWords(words, " ");
      })
      .filter((tenant) => tenant !== undefined);
    if (hasTenants) {
      row.tenants = sublineValues;
    } else {
      row.sublines = sublineValues;
    }
  }

  parseFields(): void {
    this.forEachRow((row, lines) => {
      try {
        this.parseAptStat(row, lines);
        this.parseFilingDate(row, lines);
        this.parseRents(row, lines);
        this.parseReasons(row, lines);
        this.parseLeaseStart(row, lines);
        this.parseLeaseEnd(row, lines);
        this.parseTenants(row, lines);
      } catch (err) {
        console.error(
          "failed to parse row",
          JSON.stringify({ error: err, row, lines }, null, 2),
        );
        throw err;
      }
    });
  }

  getColumnPositions(): ColumnPosition[] {
    // TODO handle multiple tables on page, first page
    const headerCells = this.textractTables[0]!.rows[0]!.cells;
    if (headerCells.length === 8) {
      return headerCells.map(({ left, right }) => ({ left, right }));
    }

    const cellsToAssign = headerCells.slice();
    const columnPositions: ColumnPosition[] = new Array(8);
    // assign all correct header cells
    headerCells.forEach(({ text, ...pos }, cellIndex) => {
      this.regexHeaders.forEach((regex, positionIndex) => {
        if (text.match(regex)) {
          columnPositions[positionIndex] = pos;
          cellsToAssign[cellIndex] = null;
        }
      });
    });
    const remainingCells = cellsToAssign.filter((x) => x !== null);

    if (columnPositions.filter((x) => x !== null).length === 8) {
      return columnPositions;
    }

    const regYearPos = columnPositions[0];
    // most common for aptStat and filingDate to be combined. AptStat should be
    // about 93% of the width of regYear, so we can split that way.
    remainingCells.forEach(({ text, left, right }) => {
      if (text.match(this.regexAptStatFilingDate)) {
        if (regYearPos) {
          const regYearWidth = regYearPos.right - regYearPos.left;
          const aptStatPos = { left, right: left + regYearWidth };
          const filingDatePos = { left: left + regYearWidth, right };
          columnPositions[1] = aptStatPos;
          columnPositions[2] = filingDatePos;
        }
      }
    });
    if (columnPositions.filter((x) => x !== null).length === 8) {
      return columnPositions;
    }

    // TODO: Look for other cases where columns get merged and apply similar fix as above
    return columnPositions;
  }

  joinWords(line: Word[], separator: string | undefined = undefined): string {
    return line.map((word) => word.text).join(separator);
  }

  isWithin(word: Word, column: ColumnPosition): boolean {
    try {
      return (
        word.left >= column.left - this.tolerance &&
        word.right <= column.right + this.tolerance
      );
    } catch (err) {
      console.error(
        "error comparing column positions",
        JSON.stringify({
          error: err,
          colPositions: this.columnPositions,
          word,
        }),
      );
      throw err;
    }
  }

  /**
   * Combine multiple table columns to return a single ColumnPosition for use
   * with isWithin, for example to search for tenants names between aptStat and
   * paidRent.
   * @param startIndex Index of left most column to combine
   * @param endIndex Index of right most column to combine
   */
  combinedColumns(startIndex: number, endIndex: number): ColumnPosition {
    return {
      left: this.columnPositions[startIndex].left,
      right: this.columnPositions[endIndex].right,
    };
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

  getRescan(): boolean {
    if (
      this.ocrConfidence < this.ocrConfidenceThreshold ||
      Math.abs(this.orientation) > this.orientationThreshold
    ) {
      return true;
    } else {
      return false;
    }
  }
}
