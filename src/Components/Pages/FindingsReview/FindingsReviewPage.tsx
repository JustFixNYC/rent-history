import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  useRhFindingsState,
  useValidateRhFinding,
} from "../../../api/account/hooks/findingsReview";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";

import { FindingIntroPanel } from "./FindingIntroPanel";
import { FindingModuleStack } from "./FindingModuleStack";
import { FindingResultPanel } from "./FindingResultPanel";
import { FindingReviewNav } from "./FindingReviewNav";
import {
  buildAnswers,
  createInitialFormState,
  getIntro,
  getSteps,
  type PrehstpaFormState,
} from "./findings/OVERCHARGE_PREHSTPA";
import { useFindingSteps } from "./hooks/useFindingSteps";
import { useOcrConfirmState } from "./hooks/useOcrConfirmState";
import { useProgressiveReveal } from "./hooks/useProgressiveReveal";
import type { Finding } from "./types/finding";
import { FINDING_MODULES } from "./types/registry";
import "./FindingsReview.scss";

type PrehstpaReviewFlowProps = {
  finding: Finding;
  accessToken: string;
  historyId: string;
};

const PrehstpaReviewFlow = ({
  finding,
  accessToken,
  historyId,
}: PrehstpaReviewFlowProps) => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const stackEndRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState<PrehstpaFormState>(() =>
    createInitialFormState(finding),
  );
  const [validatedFinding, setValidatedFinding] = useState<Finding | null>(null);

  const ocrState = useOcrConfirmState();
  const validateMutation = useValidateRhFinding();

  const onFormStateChange = useCallback((patch: Partial<PrehstpaFormState>) => {
    setFormState((prev) => ({ ...prev, ...patch }));
  }, []);

  const answers = useMemo(
    () => buildAnswers(finding, formState),
    [finding, formState],
  );

  const steps = useMemo(
    () =>
      getSteps({
        finding,
        formState,
        onFormStateChange,
        ocrPhase: ocrState.phase,
        onOcrConfirm: ocrState.confirm,
        onOcrEdit: ocrState.edit,
      }),
    [
      finding,
      formState,
      onFormStateChange,
      ocrState.phase,
      ocrState.confirm,
      ocrState.edit,
    ],
  );

  const { visibleSteps } = useFindingSteps(steps, answers);
  const showResult = validatedFinding?.result != null;

  const isActiveStepComplete = useCallback(
    (stepIndex: number) => {
      if (showResult) {
        return true;
      }

      const activeStep = visibleSteps[stepIndex];
      if (!activeStep) {
        return false;
      }

      switch (activeStep.id) {
        case "ocr_confirm":
          return ocrState.isConfirmed;
        case "vacancy":
          return formState.getsVacancyIncrease !== null;
        case "tenancy_start":
          return formState.tenancyStart !== null;
        default:
          return false;
      }
    },
    [
      showResult,
      visibleSteps,
      ocrState.isConfirmed,
      formState.getsVacancyIncrease,
      formState.tenancyStart,
    ],
  );

  const {
    revealedCount,
    activeStepIndex,
    goNext,
    goBack,
    canGoBack,
    isLastStep,
  } = useProgressiveReveal({
    stepCount: visibleSteps.length,
    isActiveStepComplete,
  });

  const activeStepReady = isActiveStepComplete(activeStepIndex);

  useEffect(() => {
    stackEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revealedCount, showResult]);

  const intro = useMemo(() => getIntro(finding), [finding]);

  const handleNext = () => {
    if (showResult) {
      navigate(`/${i18n.locale}/report`);
      return;
    }

    if (!activeStepReady || validateMutation.isPending) {
      return;
    }

    if (isLastStep) {
      validateMutation.mutate(
        {
          accessToken,
          body: {
            history_id: historyId,
            finding_id: finding.id,
            answers: buildAnswers(finding, formState),
          },
        },
        {
          onSuccess: (response) => {
            setValidatedFinding(response.finding);
          },
        },
      );
      return;
    }

    goNext();
  };

  const handleBack = () => {
    if (validateMutation.isPending) {
      return;
    }

    if (showResult) {
      setValidatedFinding(null);
    }

    goBack();
  };

  const nextLabel = showResult ? _(msg`Continue`) : undefined;
  const nextDisabled = !showResult && !activeStepReady;

  return (
    <>
      <FindingIntroPanel {...intro} />
      <FindingModuleStack
        steps={visibleSteps}
        revealedCount={revealedCount}
        activeStepIndex={activeStepIndex}
      />
      {showResult && validatedFinding?.result ? (
        <FindingResultPanel result={validatedFinding.result} />
      ) : null}
      <div ref={stackEndRef} aria-hidden="true" />
      <FindingReviewNav
        onBack={handleBack}
        onNext={handleNext}
        isValidating={validateMutation.isPending}
        backDisabled={!canGoBack && !showResult}
        nextDisabled={nextDisabled}
        nextLabel={nextLabel}
      />
    </>
  );
};

const FindingsReviewPage = () => {
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  const { data, isLoading, isError } = useRhFindingsState({
    accessToken: session?.accessToken,
    historyId: historyId ?? undefined,
  });

  const currentFinding = data?.findings_current[0];
  const module =
    currentFinding?.type != null
      ? FINDING_MODULES[currentFinding.type as keyof typeof FINDING_MODULES]
      : undefined;

  return (
    <main className="findings-review-page">
      <div className="findings-review-body">
        {isLoading ? (
          <p>
            <Trans>Loading findings…</Trans>
          </p>
        ) : null}
        {isError ? (
          <p>
            <Trans>Unable to load findings state.</Trans>
          </p>
        ) : null}
        {currentFinding && module && session?.accessToken && historyId ? (
          <PrehstpaReviewFlow
            key={currentFinding.id}
            finding={currentFinding}
            accessToken={session.accessToken}
            historyId={historyId}
          />
        ) : null}
        {currentFinding && !module ? (
          <p data-testid="findings-review-unsupported">
            <Trans>Unsupported finding type: {currentFinding.type}</Trans>
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default FindingsReviewPage;
