// Textract

export type Word = {
  text: string;
  left: number;
  right: number;
};

export type TextractLines = Word[][];

export type TextractCell = {
  text: string;
  left: number;
  right: number;
};

export type TextractRow = {
  confidence: number | undefined;
  ocrConfidence: number | undefined;
  cells: TextractCell[];
};

export type TextractTable = {
  type: string | undefined;
  confidence: number | undefined;
  ocrConfidence: number | undefined;
  rows: TextractRow[];
};

export type TextractRentHistoryPage = {
  pageOrientationDegrees: number | undefined;
  tables: TextractTable[];
  lines: TextractLines;
};


// Standardize

export type ColumnPosition = { left: number; right: number };

export type CleanRow = {
  regYear: string | null;
  aptStat: string | null;
  filingDate: string | null;
  legalRent: string | null;
  prefRent: string | null;
  paidRent: string | null;
  reasons: string[];
  leaseStart: string | null;
  leaseEnd: string | null;
  tenants: string[];
  _isFullRowStat: boolean;
  _lineIndexes: number[];
  _flagForReview: boolean;
};

export type CleanTable = CleanRow[];
