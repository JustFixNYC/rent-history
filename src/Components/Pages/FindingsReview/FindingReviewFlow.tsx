import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useValidateRhFinding } from "../../../api/account/hooks/findingsReview";

import { FindingIntroPanel } from "./FindingIntroPanel";
import { FindingModuleStack } from "./FindingModuleStack";
import { FindingResultModal } from "./FindingResultModal";
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
  const stackEndRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState<Record<string, unknown>>(
    () => module.createInitialFormState(finding) as Record<string, unknown>
  );
  const [validatedFinding, setValidatedFinding] = useState<Finding | null>(
    null
  );

  const ocrState = useOcrConfirmState();
  const validateMutation = useValidateRhFinding();

  const onFormStateChange = useCallback<
    AnyFindingModuleStepBindings["onFormStateChange"]
  >((patch) => {
    setFormState((prev) => ({ ...prev, ...patch }));
  }, []);

  const answers = useMemo(
    () => module.buildAnswers(finding, formState),
    [module, finding, formState]
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
    ]
  );

  const { visibleSteps } = useFindingSteps(steps, answers);
  const showResultModal = validatedFinding?.result != null;

  const stepCompleteCtx = useMemo(
    () => ({ ocrConfirmed: ocrState.isConfirmed }),
    [ocrState.isConfirmed]
  );

  const isActiveStepComplete = useCallback(
    (stepIndex: number) => {
      const activeStep = visibleSteps[stepIndex];
      if (!activeStep) {
        return false;
      }

      return module.isStepComplete(activeStep.id, formState, stepCompleteCtx);
    },
    [visibleSteps, module, formState, stepCompleteCtx]
  );

  const allStepsComplete = useMemo(
    () =>
      visibleSteps.length > 0 &&
      visibleSteps.every((step) =>
        module.isStepComplete(step.id, formState, stepCompleteCtx)
      ),
    [visibleSteps, module, formState, stepCompleteCtx]
  );

  const { revealedCount, activeStepIndex, goBack, canGoBack } =
    useProgressiveReveal({
      stepCount: visibleSteps.length,
      isActiveStepComplete,
      autoRevealOnComplete: true,
    });

  const resultContent = useMemo(
    () =>
      validatedFinding?.result != null
        ? module.renderResult(validatedFinding)
        : null,
    [module, validatedFinding]
  );

  useEffect(() => {
    stackEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [revealedCount]);

  const handleSubmit = () => {
    if (!allStepsComplete || validateMutation.isPending) {
      return;
    }

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
      }
    );
  };

  const handleBack = () => {
    if (validateMutation.isPending) {
      return;
    }

    if (showResultModal) {
      setValidatedFinding(null);
      return;
    }

    goBack();
  };

  const handleResultModalBack = () => {
    setValidatedFinding(null);
  };

  const handleResultModalNext = () => {
    // Queue advance wired in Task 4.
  };

  return (
    <>
      <FindingIntroPanel {...module.getIntro(finding)} />
      <FindingModuleStack
        steps={visibleSteps}
        revealedCount={revealedCount}
        activeStepIndex={activeStepIndex}
      />
      <div ref={stackEndRef} aria-hidden="true" />
      <FindingReviewNav
        onBack={handleBack}
        onNext={handleSubmit}
        isValidating={validateMutation.isPending}
        backDisabled={!canGoBack && !showResultModal}
        nextDisabled={!allStepsComplete}
      />
      {showResultModal && validatedFinding?.result && resultContent ? (
        <FindingResultModal
          isOpen
          result={validatedFinding.result}
          title={resultContent.title}
          body={resultContent.body}
          onBack={handleResultModalBack}
          onNext={handleResultModalNext}
        />
      ) : null}
    </>
  );
}
