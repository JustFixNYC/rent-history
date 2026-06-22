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

const resolveMockResult = (finding: Finding): FindingResult => {
  for (const row of finding.data.rows) {
    if (row.gets_vacancy_increase === false) {
      return "no_violation";
    }
  }

  return "potential_violation";
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

    finding.result = resolveMockResult(finding);

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
