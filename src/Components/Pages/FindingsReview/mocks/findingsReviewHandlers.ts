import { delay, http, HttpResponse } from "msw";

import findingExamples from "../__fixtures__/findingExamples.json";
import type {
  Finding,
  FindingResult,
  ValidateFindingAnswers,
  ValidateFindingRequest,
} from "../types";

const VALIDATE_FINDING_DELAY_MS = 800;

const pilotFinding = () =>
  structuredClone(findingExamples.OVERCHARGE_PREHSTPA as Finding);

const mergeAnswersIntoFinding = (
  finding: Finding,
  answers: ValidateFindingAnswers
): Finding => {
  const answersByYear = new Map(answers.rows.map((row) => [row.reg_year, row]));

  return {
    ...finding,
    status: "validated",
    validated_at: new Date().toISOString(),
    data: {
      rows: finding.data.rows.map((row) => ({
        ...row,
        ...answersByYear.get(row.reg_year),
      })),
    },
  };
};

const buildStubResult = (
  finding: Finding,
  outcome: FindingResult["outcome"]
): FindingResult => {
  const [row0, row1] = finding.data.rows;

  return {
    outcome,
    year0: row0.reg_year,
    year1: row1.reg_year,
    rent0: row0.legal_rent ?? 0,
    rent1: row1.legal_rent ?? 0,
  };
};

const resolveOutcome = (
  answers: ValidateFindingAnswers
): FindingResult["outcome"] => {
  const vacancyRow = answers.rows.find(
    (row) =>
      row.gets_vacancy_increase !== undefined &&
      row.gets_vacancy_increase !== null
  );

  return vacancyRow?.gets_vacancy_increase === false
    ? "explained_away"
    : "confirmed";
};

export const findingsReviewHandlers = [
  http.get("*/rh/history/findings-state", ({ request }) => {
    const url = new URL(request.url);
    const historyId = url.searchParams.get("history_id");

    if (!historyId) {
      return HttpResponse.json(
        { detail: "history_id is required." },
        { status: 400 }
      );
    }

    const finding = pilotFinding();

    return HttpResponse.json({
      findings_current: [finding],
      review_queue: { ordered_ids: [finding.id] },
    });
  }),

  http.post("*/rh/history/validate-finding", async ({ request }) => {
    await delay(VALIDATE_FINDING_DELAY_MS);

    const body = (await request.json()) as ValidateFindingRequest;
    const finding = mergeAnswersIntoFinding(pilotFinding(), body.answers);
    const outcome = resolveOutcome(body.answers);

    finding.result = buildStubResult(finding, outcome);

    return HttpResponse.json({
      finding,
      queue_delta: {
        ordered_ids: [],
        added: [],
        removed: [finding.id],
        current_index_hint: null,
      },
    });
  }),
];
