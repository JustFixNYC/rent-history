import { Fragment } from "react";
import { Checkbox } from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";

import {
  OcrLegalRentField,
  OcrPrefRentField,
} from "../../fields/OcrFieldWrappers";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { Prefrent421aFormState } from "./answers";
import { NO_PREF_RENT_LABEL, OcrHeading } from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export type Prefrent421aGetStepsBindings = {
  finding: Finding;
  formState: Prefrent421aFormState;
  onFormStateChange: (patch: Partial<Prefrent421aFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const ID_PREFIX = "prefrent-421a";

type OcrRightColumnProps = {
  finding: Finding;
  formState: Prefrent421aFormState;
  onFormStateChange: (patch: Partial<Prefrent421aFormState>) => void;
  readonly: boolean;
};

const OcrRightColumn = ({
  finding,
  formState,
  onFormStateChange,
  readonly,
}: OcrRightColumnProps) => {
  const { _ } = useLingui();
  const wireRow = finding.data.rows[ROW_INDEX.context];
  const prefRentReadonly = readonly || formState.row0NoPrefRent;

  return (
    <Fragment>
      <OcrLegalRentField
        id={`${ID_PREFIX}-ocr-rent-0`}
        value={formState.row0LegalRent}
        onChange={(value) => onFormStateChange({ row0LegalRent: value })}
        readonly={readonly}
      />
      <OcrPrefRentField
        id={`${ID_PREFIX}-ocr-pref-rent-0`}
        value={formState.row0PrefRent}
        onChange={(value) => onFormStateChange({ row0PrefRent: value })}
        readonly={prefRentReadonly}
      />
      <Checkbox
        id={`${ID_PREFIX}-ocr-no-pref-rent-0`}
        labelText={_(NO_PREF_RENT_LABEL)}
        checked={formState.row0NoPrefRent}
        disabled={readonly}
        onChange={(event) => {
          const checked = event.target.checked;
          onFormStateChange({
            row0NoPrefRent: checked,
            row0PrefRent: checked
              ? ""
              : wireRow?.pref_rent != null
              ? String(wireRow.pref_rent)
              : "",
          });
        }}
      />
    </Fragment>
  );
};

const STANDARD_OCR_ROWS = [
  {
    dataRowIndex: ROW_INDEX.context,
    formRowIndex: 0,
    left: "apt_stat" as const,
  },
];

export function getSteps(
  bindings: Prefrent421aGetStepsBindings
): FindingStep[] {
  const {
    finding,
    formState,
    onFormStateChange,
    ocrPhase,
    onOcrConfirm,
    onOcrEdit,
  } = bindings;
  const [ocrRow] = buildStandardOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix: ID_PREFIX,
    rows: STANDARD_OCR_ROWS,
  });

  const ocrRows = [
    {
      ...ocrRow,
      renderRight: ({ readonly }: { readonly: boolean }) => (
        <OcrRightColumn
          finding={finding}
          formState={formState}
          onFormStateChange={onFormStateChange}
          readonly={readonly}
        />
      ),
    },
  ];

  return [
    {
      id: "ocr_confirm",
      stepNumber: 1,
      render: ({ isPastStep }) => (
        <OcrConfirmStep
          stepNumber={1}
          title={<OcrHeading />}
          rows={ocrRows}
          isPastStep={isPastStep}
          phase={ocrPhase}
          onConfirm={onOcrConfirm}
          onEdit={onOcrEdit}
        />
      ),
    },
  ];
}
