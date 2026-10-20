import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { isAccountApiError } from "../../../api/account";
import { useValidateRhFinding } from "../../../api/account/hooks/findingsReview";
import { accountQueryKeys } from "../../../api/account/queryKeys";
import type { RhFindingsStateResponse } from "../../../api/account/types";

import { analyzePath } from "../../../routes/analyzeRoutes";
import { FlowNav } from "../../FlowNav";
import { FindingIntroPanel } from "./FindingIntroPanel";
import { FindingModuleStack } from "./FindingModuleStack";
import { FindingResultModal } from "./FindingResultModal";
import { useFindingSteps } from "./hooks/useFindingSteps";
import { useOcrConfirmState } from "./hooks/useOcrConfirmState";
import { useProgressiveReveal } from "./hooks/useProgressiveReveal";
import type { Finding, ValidateFindingResponse } from "./types/finding";
import type {
  AnyFindingModuleStepBindings,
  AnyFindingReviewModule,
} from "./types/findingModule";

/** Optional dev-only submit stub for `/dev/findings-review` (FindingsReview/dev sandbox). */
export type DevValidateMutate = (
  variables: {
    accessToken: string;
    body: {
      history_id: string;
      finding_id: string;
      answers: ReturnType<AnyFindingReviewModule["buildAnswers"]>;
    };
  },
  options?: {
    onSuccess?: (data: ValidateFindingResponse) => void;
    onError?: (error: unknown) => void;
  }
) => void;

type FindingReviewFlowProps = {
  module: AnyFindingReviewModule;
  finding: Finding;
  accessToken: string;
  historyId: string;
  onAdvanceToFinding: (findingId: string) => void;
  /** Dev-only: bypasses `useValidateRhFinding` when set. */
  devValidateMutate?: DevValidateMutate;
  devValidateIsPending?: boolean;
};

export function FindingReviewFlow({
  module,
  finding,
  accessToken,
  historyId,
  onAdvanceToFinding,
  devValidateMutate,
  devValidateIsPending = false,
}: FindingReviewFlowProps) {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const stackEndRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState<Record<string, unknown>>(
    () => module.createInitialFormState(finding) as Record<string, unknown>
  );
  const [validatedFinding, setValidatedFinding] = useState<Finding | null>(
    null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const ocrState = useOcrConfirmState();
  const validateMutation = useValidateRhFinding();
  const isValidatePending =
    devValidateMutate != null
      ? devValidateIsPending
      : validateMutation.isPending;

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

  useEffect(() => {
    setSubmitError(null);
  }, [formState]);

  const handleSubmit = () => {
    if (!allStepsComplete || isValidatePending) {
      return;
    }

    setSubmitError(null);

    const variables = {
      accessToken,
      body: {
        history_id: historyId,
        finding_id: finding.id,
        answers: module.buildAnswers(finding, formState),
      },
    };

    const callbacks = {
      onSuccess: (response: ValidateFindingResponse) => {
        if (response.finding.result == null) {
          setSubmitError(
            _(
              msg`Your answers were validated, but we could not show a result. Please try again.`
            )
          );
          return;
        }
        setValidatedFinding(response.finding);
      },
      onError: (error: unknown) => {
        if (isAccountApiError(error)) {
          setSubmitError(error.message);
          return;
        }
        setSubmitError(
          _(msg`Unable to submit your answers. Please try again.`)
        );
      },
    };

    if (devValidateMutate) {
      devValidateMutate(variables, callbacks);
      return;
    }

    validateMutation.mutate(variables, callbacks);
  };

  const handleBack = () => {
    if (isValidatePending) {
      return;
    }

    if (showResultModal) {
      setValidatedFinding(null);
      return;
    }

    goBack();
  };

  const getReviewQueueRemainingIds = useCallback(() => {
    const findingsState = queryClient.getQueryData<RhFindingsStateResponse>(
      accountQueryKeys.findingsState(historyId)
    );
    return findingsState?.review_queue.ordered_ids ?? [];
  }, [queryClient, historyId]);

  const handleResultModalBack = () => {
    setValidatedFinding(null);
  };

  const handleResultModalNext = () => {
    const remainingIds = getReviewQueueRemainingIds();

    setValidatedFinding(null);

    if (remainingIds.length === 0) {
      navigate(analyzePath(i18n.locale, "report"));
      return;
    }

    onAdvanceToFinding(remainingIds[0]);
  };

  const resultModalNextLabel = useMemo(() => {
    if (!showResultModal) {
      return _(msg`Next`);
    }

    return getReviewQueueRemainingIds().length === 0
      ? _(msg`View report`)
      : _(msg`Next`);
  }, [showResultModal, getReviewQueueRemainingIds, _]);

  return (
    <>
      <FindingIntroPanel {...module.getIntro(finding)} />
      <FindingModuleStack
        steps={visibleSteps}
        revealedCount={revealedCount}
        activeStepIndex={activeStepIndex}
      />
      <div ref={stackEndRef} aria-hidden="true" />
      {submitError ? (
        <p className="findings-review-submit-error" role="alert">
          {submitError}
        </p>
      ) : null}
      <FlowNav
        onBack={handleBack}
        onNext={handleSubmit}
        isNextLoading={isValidatePending}
        backDisabled={!canGoBack && !showResultModal}
        nextDisabled={!allStepsComplete}
        ariaLabel={_(msg`Finding review navigation`)}
      />
      {showResultModal && validatedFinding?.result && resultContent ? (
        <FindingResultModal
          isOpen
          result={validatedFinding.result}
          title={resultContent.title}
          body={resultContent.body}
          onBack={handleResultModalBack}
          onNext={handleResultModalNext}
          nextLabel={resultModalNextLabel}
        />
      ) : null}
    </>
  );
}
