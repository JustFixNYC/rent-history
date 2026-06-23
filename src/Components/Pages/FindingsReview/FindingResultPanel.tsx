import classNames from "classnames";
import { InfoBox } from "@justfixnyc/component-library";
import type { ReactNode } from "react";

import type { FindingResult } from "./types/finding";

export type FindingResultPanelProps = {
  result: FindingResult;
  title: ReactNode;
  body: ReactNode;
  className?: string;
};

export const FindingResultPanel = ({
  result,
  title,
  body,
  className,
}: FindingResultPanelProps) => {
  const isPotentialViolation = result === "potential_violation";

  return (
    <section
      className={classNames(
        "finding-result-panel",
        isPotentialViolation
          ? "finding-result-panel--confirmed"
          : "finding-result-panel--explained-away",
        className
      )}
      data-testid="finding-result-panel"
      data-outcome={result}
      aria-live="polite"
    >
      <InfoBox color="white" className="finding-result-panel__info-box">
        <p className="finding-result-panel__title">{title}</p>
        <p className="finding-result-panel__body">{body}</p>
      </InfoBox>
    </section>
  );
};
