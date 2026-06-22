import type { Finding } from "../../types/finding";
import { FindingResultPanel } from "../../FindingResultPanel";

import { ROW_INDEX } from "./spec";
import {
  ResultConfirmedBody,
  ResultConfirmedTitle,
  ResultExplainedAwayBody,
  ResultExplainedAwayTitle,
} from "./ReviewCopy";

// TODO later may refactor to reduce repetition across finding types given similar structure
export function renderPrehstpaResult(finding: Finding) {
  const result = finding.result;
  if (!result) {
    return null;
  }

  const row0 = finding.data.rows[ROW_INDEX.tenancy];
  const row1 = finding.data.rows[ROW_INDEX.vacancy];
  const copyProps = {
    rent0: Number(row0?.legal_rent ?? 0),
    rent1: Number(row1?.legal_rent ?? 0),
    year0: row0?.reg_year ?? 0,
    year1: row1?.reg_year ?? 0,
  };

  const isPotentialViolation = result === "potential_violation";

  return (
    <FindingResultPanel
      result={result}
      title={
        isPotentialViolation ? (
          <ResultConfirmedTitle />
        ) : (
          <ResultExplainedAwayTitle />
        )
      }
      body={
        isPotentialViolation ? (
          <ResultConfirmedBody {...copyProps} />
        ) : (
          <ResultExplainedAwayBody {...copyProps} />
        )
      }
    />
  );
}
