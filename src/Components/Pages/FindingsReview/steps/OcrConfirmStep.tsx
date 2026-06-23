import { Fragment } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, LinkStyledButton } from "@justfixnyc/component-library";

import { DocumentLink } from "../DocumentLink";
import { FindingFormShell } from "../FindingFormShell";
import { StepNumberBadge } from "../StepNumberBadge";
import type { FindingStepRenderContext } from "../types/step";

import {
  useOcrConfirmState,
  type OcrConfirmPhase,
} from "../hooks/useOcrConfirmState";

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
  title: React.ReactNode;
  rows: OcrConfirmRowConfig[];
  /** When true, force confirmed readonly presentation (user moved past this step). */
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
  title,
  rows,
  isPastStep = false,
  phase: controlledPhase,
  onConfirm,
  onEdit,
  confirmLabel,
  confirmedLabel,
  editLabel,
}: OcrConfirmStepProps) => {
  const { _ } = useLingui();
  const internalOcr = useOcrConfirmState();
  const phase = controlledPhase ?? internalOcr.phase;
  const confirm = onConfirm ?? internalOcr.confirm;
  const edit = onEdit ?? internalOcr.edit;

  const handleConfirm = () => {
    confirm();
  };

  const effectivePhase = isPastStep ? "confirmed" : phase;
  const isConfirmed = effectivePhase === "confirmed";
  const readonly = isConfirmed;
  const showEditLink = isConfirmed && !isPastStep;

  const resolvedConfirmLabel =
    confirmLabel ?? _(msg`Yes, this matches my document`);
  const resolvedConfirmedLabel = confirmedLabel ?? _(msg`Values confirmed`);
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
          data-phase={effectivePhase}
        >
          <p className="ocr-confirm-step__intro">
            <Trans>Look at</Trans> <DocumentLink />{" "}
            <Trans>to confirm the information below matches.</Trans>
          </p>
          {rows.map((row, index) => (
            <Fragment key={row.regYear}>
              {index > 0 ? (
                <hr className="ocr-confirm-step__divider" aria-hidden="true" />
              ) : null}
              <div className="ocr-confirm-step__row-block">
                <h3 className="ocr-confirm-step__year-heading">
                  {row.regYear}
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
                onClick={edit}
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
          />
        )
      }
    />
  );
};

export type RenderOcrConfirmStepOptions = Pick<
  OcrConfirmStepProps,
  "stepNumber" | "title" | "rows"
>;

/** Factory for FindingModuleStack / type modules (Task 4). */
export function renderOcrConfirmStep(
  props: RenderOcrConfirmStepOptions
): (ctx: FindingStepRenderContext) => React.ReactNode {
  return ({ isPastStep }) => (
    <OcrConfirmStep {...props} isPastStep={isPastStep} />
  );
}
