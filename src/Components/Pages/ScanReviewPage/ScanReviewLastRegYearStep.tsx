import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { StepNumberBadge } from "../../StepNumberBadge/StepNumberBadge";
import { FindingFormShell } from "../FindingsReview/FindingFormShell";
import { YearField } from "../FindingsReview/fields/YearField";
import type { ScanReviewStepRenderContext } from "./ScanReviewModuleStack";

export type ScanReviewLastRegYearStepProps = {
  stepNumber: number;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  years: number[];
  isPastStep?: boolean;
};

export const ScanReviewLastRegYearStep = ({
  stepNumber,
  selectedYear,
  onYearChange,
  years,
  isPastStep = false,
}: ScanReviewLastRegYearStepProps) => {
  const { _ } = useLingui();

  return (
    <FindingFormShell
      variant={isPastStep ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={
        <Trans>
          What is the last year of rent registration shown on your document?
        </Trans>
      }
      body={
        <YearField
          id="scan-review-last-reg-year"
          labelText={_(msg`Last registration year`)}
          value={selectedYear}
          onChange={onYearChange}
          years={years}
          disabled={isPastStep}
        />
      }
    />
  );
};

export function renderScanReviewLastRegYearStep(
  props: Omit<ScanReviewLastRegYearStepProps, "isPastStep">
): (ctx: ScanReviewStepRenderContext) => React.ReactNode {
  return ({ isPastStep }) => (
    <ScanReviewLastRegYearStep {...props} isPastStep={isPastStep} />
  );
}
