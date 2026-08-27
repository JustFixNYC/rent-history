import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useConfirmRhHistoryLastRegYear } from "../../../api/account/hooks/confirmLastRegYear";
import { accountQueryKeys } from "../../../api/account/queryKeys";
import type { RhEarlyValidation } from "../../../api/account/types";
import { FlowNav } from "../../FlowNav";
import { defaultYearMax } from "../FindingsReview/fields/validation";
import { useProgressiveReveal } from "../FindingsReview/hooks/useProgressiveReveal";
import { ScanReviewMode } from "./scanReviewModes";
import { ScanReviewRescanCallout } from "./ScanReviewRescanCallout";
import { renderScanReviewLastRegYearStep } from "./ScanReviewLastRegYearStep";
import { ScanReviewModuleStack } from "./ScanReviewModuleStack";
import { flowErrorFromApi } from "../Scanner/scannerFlowUtils";

import "./ScanReviewScreen.scss";

export type ScanReviewFlowProps = {
  flowMode:
    | typeof ScanReviewMode.warningOnly
    | typeof ScanReviewMode.errorsAndWarning;
  earlyValidation: RhEarlyValidation;
  accessToken: string;
  historyId: string;
  declaredLastRegYear?: number | null;
  skipLastRegYearStep?: boolean;
  initialCalloutLabels?: string[] | null;
  isRescanPending?: boolean;
  rescanError?: string | null;
  onIncrementalRescan: () => void;
};

function buildYearDropdownOptions(scannedMaxRegYear: number): number[] {
  const currentYear = defaultYearMax();
  const years: number[] = [];
  for (let year = currentYear; year >= scannedMaxRegYear; year -= 1) {
    years.push(year);
  }
  return years;
}

export function ScanReviewFlow({
  flowMode,
  earlyValidation,
  accessToken,
  historyId,
  declaredLastRegYear = null,
  skipLastRegYearStep = false,
  initialCalloutLabels = null,
  isRescanPending = false,
  rescanError = null,
  onIncrementalRescan,
}: ScanReviewFlowProps) {
  const { _, i18n } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const stackEndRef = useRef<HTMLDivElement>(null);
  const confirmMutation = useConfirmRhHistoryLastRegYear();

  const scannedMaxRegYear = earlyValidation.scanned_max_reg_year!;
  const yearOptions = useMemo(
    () => buildYearDropdownOptions(scannedMaxRegYear),
    [scannedMaxRegYear]
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [calloutLabels, setCalloutLabels] = useState<string[] | null>(
    () => initialCalloutLabels
  );

  const isYearMismatchPhase = calloutLabels != null;

  const steps = useMemo(() => {
    const calloutStep = {
      id: "reg-year-mismatch",
      render: () =>
        isYearMismatchPhase ? (
          <ScanReviewRescanCallout
            labels={calloutLabels ?? []}
            variant="year_coverage"
            flowMode={flowMode}
            isRescanPending={isRescanPending}
            rescanError={rescanError}
            onRescan={onIncrementalRescan}
          />
        ) : null,
    };

    if (skipLastRegYearStep) {
      return [calloutStep];
    }

    return [
      {
        id: "last-reg-year",
        render: renderScanReviewLastRegYearStep({
          stepNumber: 1,
          selectedYear,
          onYearChange: setSelectedYear,
          years: yearOptions,
        }),
      },
      calloutStep,
    ];
  }, [
    calloutLabels,
    flowMode,
    isRescanPending,
    isYearMismatchPhase,
    onIncrementalRescan,
    rescanError,
    selectedYear,
    skipLastRegYearStep,
    yearOptions,
  ]);

  const isActiveStepComplete = useCallback(
    (stepIndex: number) => {
      if (skipLastRegYearStep) {
        return true;
      }
      if (stepIndex === 0) {
        return selectedYear !== null;
      }
      return true;
    },
    [selectedYear, skipLastRegYearStep]
  );

  const { revealedCount, activeStepIndex, goNext, goBack, canGoBack } =
    useProgressiveReveal({
      stepCount: steps.length,
      isActiveStepComplete,
    });

  useEffect(() => {
    stackEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [revealedCount]);

  const handleContinue = () => {
    if (
      selectedYear == null ||
      confirmMutation.isPending ||
      isYearMismatchPhase
    ) {
      return;
    }

    confirmMutation.mutate(
      {
        accessToken,
        body: {
          history_id: historyId,
          last_reg_year: selectedYear,
        },
      },
      {
        onSuccess: (response) => {
          if (response.matched) {
            void queryClient.invalidateQueries({
              queryKey: accountQueryKeys.scanPipelineStatus(historyId),
            });
            navigate(`/${i18n.locale}/compiling`, { replace: true });
            return;
          }

          setCalloutLabels(response.rescan_callout_labels ?? []);
          goNext();
        },
      }
    );
  };

  const introTitle = skipLastRegYearStep ? (
    flowMode === ScanReviewMode.warningOnly ? (
      <Trans>We still need pages from your document</Trans>
    ) : (
      <Trans>We weren&apos;t able to capture all of your rent history</Trans>
    )
  ) : flowMode === ScanReviewMode.warningOnly ? (
    <Trans>We may be missing some of your rent history</Trans>
  ) : (
    <Trans>We weren&apos;t able to capture all of your rent history</Trans>
  );

  const introDescription = skipLastRegYearStep ? (
    flowMode === ScanReviewMode.warningOnly ? (
      <Trans>
        You told us your document goes through{" "}
        <strong>{declaredLastRegYear}</strong>, but the last registration year
        we found is still <strong>{scannedMaxRegYear}</strong>. Re-scan the
        pages covering the missing years below.
      </Trans>
    ) : (
      <Trans>
        Some pages could not be read, and we still need pages through{" "}
        <strong>{declaredLastRegYear}</strong>. The last registration year we
        found is <strong>{scannedMaxRegYear}</strong>. Re-scan the pages listed
        below.
      </Trans>
    )
  ) : flowMode === ScanReviewMode.warningOnly ? (
    <Trans>
      The last registration year we found on your document is{" "}
      <strong>{scannedMaxRegYear}</strong>. Tell us the last year shown so we
      can check whether anything is missing.
    </Trans>
  ) : (
    <Trans>
      Some pages could not be read, and the last registration year we found is{" "}
      <strong>{scannedMaxRegYear}</strong>. Tell us the last year shown on your
      document so we can identify what to re-scan.
    </Trans>
  );

  const continueError = confirmMutation.isError
    ? flowErrorFromApi(
        confirmMutation.error,
        _(msg`Unable to confirm your last registration year. Please try again.`)
      )
    : null;

  const effectiveFlowMode = skipLastRegYearStep
    ? ScanReviewMode.warningYearMismatch
    : flowMode;

  return (
    <div
      className="scan-review-flow"
      data-testid="scan-review-flow"
      data-flow-mode={effectiveFlowMode}
      aria-live="polite"
    >
      <section
        className="scan-review-flow__intro"
        data-testid="scan-review-flow-intro"
      >
        <h2 className="scan-review-flow__title">{introTitle}</h2>
        <p className="scan-review-flow__description">{introDescription}</p>
      </section>

      <ScanReviewModuleStack
        steps={steps}
        revealedCount={revealedCount}
        activeStepIndex={activeStepIndex}
      />
      <div ref={stackEndRef} aria-hidden="true" />

      {continueError ? (
        <p
          className="scan-review-flow__continue-error"
          role="alert"
          data-testid="scan-review-continue-error"
        >
          {continueError}
        </p>
      ) : null}

      {!isYearMismatchPhase ? (
        <FlowNav
          className="scan-review-flow__nav"
          onBack={goBack}
          onNext={handleContinue}
          isNextLoading={confirmMutation.isPending}
          backDisabled={!canGoBack}
          nextDisabled={selectedYear == null}
          nextLabel={_(msg`Continue`)}
          ariaLabel={_(msg`Scan review navigation`)}
        />
      ) : null}
    </div>
  );
}
