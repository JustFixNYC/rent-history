import classNames from "classnames";
import { InfoBox } from "@justfixnyc/component-library";
import type { ReactNode } from "react";

import type { FindingResultOutcome } from "./types/finding";

export type FindingResultPanelProps = {
  outcome: FindingResultOutcome;
  title: ReactNode;
  body: ReactNode;
};

export const FindingResultPanel = ({
  outcome,
  title,
  body,
}: FindingResultPanelProps) => {
  const isConfirmed = outcome === "confirmed";

  return (
    <section
      className={classNames(
        "finding-result-panel",
        isConfirmed
          ? "finding-result-panel--confirmed"
          : "finding-result-panel--explained-away"
      )}
      data-testid="finding-result-panel"
      data-outcome={outcome}
      aria-live="polite"
    >
      <InfoBox color="white" className="finding-result-panel__info-box">
        <p className="finding-result-panel__title">{title}</p>
        <p className="finding-result-panel__body">{body}</p>
      </InfoBox>
    </section>
  );
};
