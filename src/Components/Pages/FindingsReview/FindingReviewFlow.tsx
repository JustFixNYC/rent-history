import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useValidateRhFinding } from "../../../api/account/hooks/findingsReview";

import { FindingIntroPanel } from "./FindingIntroPanel";
import { FindingModuleStack } from "./FindingModuleStack";
import { FindingReviewNav } from "./FindingReviewNav";
import { useFindingSteps } from "./hooks/useFindingSteps";
import { useOcrConfirmState } from "./hooks/useOcrConfirmState";
import { useProgressiveReveal } from "./hooks/useProgressiveReveal";
import type { Finding } from "./types/finding";
import type {
  AnyFindingModuleStepBindings,
  AnyFindingReviewModule,
} from "./types/findingModule";

type FindingReviewFlowProps = {
  module: AnyFindingReviewModule;
  finding: Finding;
  accessToken: string;
  historyId: string;
};

export function FindingReviewFlow({
  module,
  finding,
  accessToken,
  historyId,
}: FindingReviewFlowProps) {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const stackEndRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState<Record<string, unknown>>(() =>
    module.createInitialFormState(finding) as Record<string, unknown>,
  );
  const [validatedFinding, setValidatedFinding] = useState<Finding | null>(null);

  const ocrState = useOcrConfirmState();
  const validateMutation = useValidateRhFinding();

  const onFormStateChange = useCallback<
    AnyFindingModuleStepBindings["onFormStateChange"]
  >((patch) => {
    setFormState((prev) => ({ ...prev, ...patch }));
  }, []);

  const answers = useMemo(
    () => module.buildAnswers(finding, formState),
    [module, finding, formState],
  );

  const steps = useMemo(
    () =>
      module.getSteps({
        finding,
        formState,
        onFormStateChange,
        ocrPhase: ocrState.phase,
        onOcrConfirm: ocrState.confirm,
        onOcrEdit: ocrState.edit,
      }),
    [
      module,
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

      return module.isStepComplete(activeStep.id, formState, {
        ocrConfirmed: ocrState.isConfirmed,
      });
    },
    [showResult, visibleSteps, module, formState, ocrState.isConfirmed],
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

  const intro = useMemo(() => module.getIntro(finding), [module, finding]);

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
            answers: module.buildAnswers(finding, formState),
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
      {showResult && validatedFinding?.result
        ? module.renderResult(validatedFinding.result)
        : null}
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
}
