import { Fragment } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, LinkStyledButton } from "@justfixnyc/component-library";

import { FindingFormShell } from "../FindingFormShell";
import { OcrConfirmHeading } from "../shared/stepCopy";
import { StepNumberBadge } from "../../../StepNumberBadge/StepNumberBadge";
import type { FindingStepRenderContext } from "../types/step";

import {
  useOcrConfirmState,
  type OcrConfirmPhase,
} from "../hooks/useOcrConfirmState";
import { useFindingReviewInteractionLock } from "../hooks/useFindingReviewInteractionLock";

export type OcrConfirmRowFieldContext = {
  readonly: boolean;
};

export type OcrConfirmRowConfig = {
  regYear: number;
  renderLeft: (ctx: OcrConfirmRowFieldContext) => React.ReactNode;
  renderRight: (ctx: OcrConfirmRowFieldContext) => React.ReactNode;
};

export type OcrConfirmStepProps = {
  stepNumber: number;
  intro: React.ReactNode;
  rows: OcrConfirmRowConfig[];
  title?: React.ReactNode;
  /** Set by the module stack when a later step is active; does not affect confirm/edit. */
  isPastStep?: boolean;
  /** Controlled phase; when omitted, uses internal `useOcrConfirmState`. */
  phase?: OcrConfirmPhase;
  onConfirm?: () => void;
  onEdit?: () => void;
  confirmLabel?: string;
  confirmedLabel?: string;
  editLabel?: string;
};

export const OcrConfirmStep = ({
  stepNumber,
  intro,
  rows,
  title = <OcrConfirmHeading />,
  phase: controlledPhase,
  onConfirm,
  onEdit,
  confirmLabel,
  confirmedLabel,
  editLabel,
}: OcrConfirmStepProps) => {
  const { _ } = useLingui();
  const { locked: interactionLocked } = useFindingReviewInteractionLock();
  const internalOcr = useOcrConfirmState();
  const phase = controlledPhase ?? internalOcr.phase;
  const confirm = onConfirm ?? internalOcr.confirm;
  const edit = onEdit ?? internalOcr.edit;

  const handleConfirm = () => {
    if (interactionLocked) {
      return;
    }
    confirm();
  };

  const handleEdit = () => {
    if (interactionLocked) {
      return;
    }
    edit();
  };

  const isConfirmed = phase === "confirmed";
  const readonly = isConfirmed || interactionLocked;
  const showEditLink = isConfirmed;

  const resolvedConfirmLabel =
    confirmLabel ?? _(msg`Yes, this matches my rent history`);
  const resolvedConfirmedLabel = confirmedLabel ?? resolvedConfirmLabel;
  const resolvedEditLabel = editLabel ?? _(msg`Edit`);

  return (
    <FindingFormShell
      variant={isConfirmed ? "completed" : "active"}
      badge={<StepNumberBadge stepNumber={stepNumber} />}
      title={title}
      body={
        <div
          className="ocr-confirm-step"
          data-testid="ocr-confirm-step"
          data-phase={phase}
          data-interaction-locked={interactionLocked ? "true" : "false"}
        >
          {intro}
          {rows.map((row, index) => (
            <Fragment key={row.regYear}>
              {index > 0 ? (
                <hr className="ocr-confirm-step__divider" aria-hidden="true" />
              ) : null}
              <div className="ocr-confirm-step__row-block">
                <h3 className="ocr-confirm-step__year-heading">
                  <Trans id="findings.ocr_confirm.year_heading">
                    Year: {row.regYear}
                  </Trans>
                </h3>
                <div className="ocr-confirm-step__values-row">
                  <div className="ocr-confirm-step__values-left">
                    {row.renderLeft({ readonly })}
                  </div>
                  <div className="ocr-confirm-step__values-right">
                    {row.renderRight({ readonly })}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      }
      cta={
        isConfirmed ? (
          <div className="ocr-confirm-step__cta-group">
            <Button
              className="ocr-confirm-step__cta-confirmed"
              labelText={resolvedConfirmedLabel}
              labelIcon="check"
              disabled
            />
            {showEditLink ? (
              <LinkStyledButton
                className="ocr-confirm-step__edit-link"
                onClick={handleEdit}
                disabled={interactionLocked}
              >
                {resolvedEditLabel}
              </LinkStyledButton>
            ) : null}
          </div>
        ) : (
          <Button
            className="ocr-confirm-step__cta-primary"
            labelText={resolvedConfirmLabel}
            variant="secondary"
            onClick={handleConfirm}
            disabled={interactionLocked}
          />
        )
      }
    />
  );
};

export type RenderOcrConfirmStepOptions = Pick<
  OcrConfirmStepProps,
  "stepNumber" | "intro" | "rows" | "title"
>;

/** Factory for FindingModuleStack / type modules (Task 4). */
export function renderOcrConfirmStep(
  props: RenderOcrConfirmStepOptions
): (ctx: FindingStepRenderContext) => React.ReactNode {
  return ({ isPastStep }) => (
    <OcrConfirmStep {...props} isPastStep={isPastStep} />
  );
}
