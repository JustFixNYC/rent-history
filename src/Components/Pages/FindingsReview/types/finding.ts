/** MVP finding wire shape — mirrors auth-provider fixtures (no `form` on wire). */

export const FINDING_STATUSES = [
  "pending",
  "in_review",
  "validated",
  "dismissed",
] as const;

export type FindingStatus = (typeof FINDING_STATUSES)[number];

export type FindingKey = {
  type: string;
  finding_year: number;
  subtype: string | null;
};

export type FindingDataRow = {
  reg_year: number;
  legal_rent?: number;
  pref_rent?: number | null;
  tenants?: string[];
  tenancy_start?: number | null;
  gets_vacancy_increase?: boolean | null;
  rgb_pct?: number;
  status?: string;
  [key: string]: unknown;
};

export type FindingData = {
  rows: FindingDataRow[];
};

export type FindingResultOutcome = "confirmed" | "explained_away";

/** Local stub until backend `result` spec lands in OpenAPI. */
export type FindingResult = {
  outcome: FindingResultOutcome;
  rent0: number;
  rent1: number;
  year0: number;
  year1: number;
};

export type Finding = {
  id: string;
  key: FindingKey;
  type: string;
  finding_year: number;
  status: FindingStatus;
  data: FindingData;
  result?: FindingResult | null;
  validated_at: string | null;
};

export type ValidateFindingAnswers = {
  rows: FindingDataRow[];
};

export type ValidateFindingRequest = {
  history_id: string;
  finding_id: string;
  answers: ValidateFindingAnswers;
};

export type QueueDelta = {
  ordered_ids: string[];
  added: string[];
  removed: string[];
  current_index_hint: number | null;
};

export type ValidateFindingResponse = {
  finding: Finding;
  queue_delta: QueueDelta;
};

export type ReviewQueue = {
  ordered_ids: string[];
};

export type FindingsStateResponse = {
  findings_current: Finding[];
  review_queue: ReviewQueue;
};
