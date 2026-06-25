import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { AptStatField } from "../../fields/AptStatField";
import { CurrencyField } from "../../fields/CurrencyField";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import {
  OcrConfirmStep,
  type OcrConfirmRowConfig,
} from "../../steps/OcrConfirmStep";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { LegalrentPosthstpaFormState } from "./answers";
import { OcrHeading } from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export type LegalrentPosthstpaGetStepsBindings = {
  finding: Finding;
  formState: LegalrentPosthstpaFormState;
  onFormStateChange: (patch: Partial<LegalrentPosthstpaFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

type OcrAptStatFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readonly: boolean;
};

const OcrAptStatField = ({
  id,
  value,
  onChange,
  readonly,
}: OcrAptStatFieldProps) => {
  const { _ } = useLingui();

  return (
    <AptStatField
      id={id}
      labelText={_(msg`Apt Stat`)}
      value={value}
      onChange={onChange}
      readonly={readonly}
    />
  );
};

type OcrCurrencyFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readonly: boolean;
};

const OcrCurrencyField = ({
  id,
  value,
  onChange,
  readonly,
}: OcrCurrencyFieldProps) => {
  const { _ } = useLingui();

  return (
    <CurrencyField
      id={id}
      labelText={_(msg`Legal Regulated Rent`)}
      value={value}
      onChange={onChange}
      readonly={readonly}
    />
  );
};

function buildOcrRows(
  finding: Finding,
  formState: LegalrentPosthstpaFormState,
  onFormStateChange: (patch: Partial<LegalrentPosthstpaFormState>) => void
): OcrConfirmRowConfig[] {
  const row0 = finding.data.rows[ROW_INDEX.row0];
  const row1 = finding.data.rows[ROW_INDEX.row1];

  return [
    {
      regYear: row0.reg_year,
      renderLeft: ({ readonly }) => (
        <OcrAptStatField
          id="legalrent-posthstpa-ocr-apt-stat-0"
          value={formState.row0AptStat}
          onChange={(value) => onFormStateChange({ row0AptStat: value })}
          readonly={readonly}
        />
      ),
      renderRight: ({ readonly }) => (
        <OcrCurrencyField
          id="legalrent-posthstpa-ocr-rent-0"
          value={formState.row0LegalRent}
          onChange={(value) => onFormStateChange({ row0LegalRent: value })}
          readonly={readonly}
        />
      ),
    },
    {
      regYear: row1.reg_year,
      renderLeft: ({ readonly }) => (
        <OcrAptStatField
          id="legalrent-posthstpa-ocr-apt-stat-1"
          value={formState.row1AptStat}
          onChange={(value) => onFormStateChange({ row1AptStat: value })}
          readonly={readonly}
        />
      ),
      renderRight: ({ readonly }) => (
        <OcrCurrencyField
          id="legalrent-posthstpa-ocr-rent-1"
          value={formState.row1LegalRent}
          onChange={(value) => onFormStateChange({ row1LegalRent: value })}
          readonly={readonly}
        />
      ),
    },
  ];
}

export function getSteps(
  bindings: LegalrentPosthstpaGetStepsBindings
): FindingStep[] {
  const {
    finding,
    formState,
    onFormStateChange,
    ocrPhase,
    onOcrConfirm,
    onOcrEdit,
  } = bindings;
  const ocrRows = buildOcrRows(finding, formState, onFormStateChange);

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
