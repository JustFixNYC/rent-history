import classNames from "classnames";
import { InfoBox } from "@justfixnyc/component-library";

import type { FindingResult } from "./types/finding";

import {
  ResultConfirmedBody,
  ResultConfirmedTitle,
  ResultExplainedAwayBody,
  ResultExplainedAwayTitle,
} from "./findings/OVERCHARGE_PREHSTPA/ReviewCopy";

export type FindingResultPanelProps = {
  result: FindingResult;
};

export const FindingResultPanel = ({ result }: FindingResultPanelProps) => {
  const isConfirmed = result.outcome === "confirmed";
  const copyProps = {
    rent0: result.rent0,
    rent1: result.rent1,
    year0: result.year0,
    year1: result.year1,
  };

  return (
    <section
      className={classNames(
        "finding-result-panel",
        isConfirmed
          ? "finding-result-panel--confirmed"
          : "finding-result-panel--explained-away",
      )}
      data-testid="finding-result-panel"
      data-outcome={result.outcome}
      aria-live="polite"
    >
      <InfoBox color="white" className="finding-result-panel__info-box">
        <p className="finding-result-panel__title">
          {isConfirmed ? <ResultConfirmedTitle /> : <ResultExplainedAwayTitle />}
        </p>
        <p className="finding-result-panel__body">
          {isConfirmed ? (
            <ResultConfirmedBody {...copyProps} />
          ) : (
            <ResultExplainedAwayBody {...copyProps} />
          )}
        </p>
      </InfoBox>
    </section>
  );
};
