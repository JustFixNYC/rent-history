import type { FindingResult } from "../../types/finding";
import { FindingResultPanel } from "../../FindingResultPanel";

import {
  ResultConfirmedBody,
  ResultConfirmedTitle,
  ResultExplainedAwayBody,
  ResultExplainedAwayTitle,
} from "./ReviewCopy";

// TODO later may refactor to reduce repetition across finding types given similar structure
export function renderPrehstpaResult(result: FindingResult) {
  const isConfirmed = result.outcome === "confirmed";
  const copyProps = {
    rent0: result.rent0,
    rent1: result.rent1,
    year0: result.year0,
    year1: result.year1,
  };

  return (
    <FindingResultPanel
      outcome={result.outcome}
      title={
        isConfirmed ? <ResultConfirmedTitle /> : <ResultExplainedAwayTitle />
      }
      body={
        isConfirmed ? (
          <ResultConfirmedBody {...copyProps} />
        ) : (
          <ResultExplainedAwayBody {...copyProps} />
        )
      }
    />
  );
}
