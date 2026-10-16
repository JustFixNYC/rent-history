import { Fragment } from "react";
import { Checkbox } from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";

import {
  OcrLegalRentField,
  OcrPrefRentField,
} from "../../fields/OcrFieldWrappers";
import { isTenancyStartStepVisible } from "../../hooks/stepVisibility";
import { patchGetsVacancyIncrease } from "../../hooks/vacancyFormState";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { SuccessionStep } from "../../steps/SuccessionStep";
import {
  VacancyStep,
  buildVacancySelfTenantSharedCopy,
} from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { NonregistrationPrefrentPosthstpaFormState } from "./answers";
import { getIntroValues } from "./getIntro";
import { NO_PREF_RENT_LABEL } from "./ReviewCopy";
import { ROW_INDEX } from "./spec";

export type NonregistrationPrefrentPosthstpaGetStepsBindings = {
  finding: Finding;
  formState: NonregistrationPrefrentPosthstpaFormState;
  onFormStateChange: (
    patch: Partial<NonregistrationPrefrentPosthstpaFormState>
  ) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const ID_PREFIX = "nonregistration-prefrent-posthstpa";

type OcrRightColumnProps = {
  finding: Finding;
  formState: NonregistrationPrefrentPosthstpaFormState;
  onFormStateChange: (
    patch: Partial<NonregistrationPrefrentPosthstpaFormState>
  ) => void;
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
  bindings: NonregistrationPrefrentPosthstpaGetStepsBindings
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

  const { year0, missingFromYear } = getIntroValues(finding);

  return [
    {
      id: "ocr_confirm",
      stepNumber: 1,
      render: ({ isPastStep }) => (
        <OcrConfirmStep
          stepNumber={1}
          intro={<OcrConfirmIntro years={[year0]} />}
          rows={ocrRows}
          isPastStep={isPastStep}
          phase={ocrPhase}
          onConfirm={onOcrConfirm}
          onEdit={onOcrEdit}
        />
      ),
    },
    {
      id: "vacancy",
      stepNumber: 2,
      render: ({ isPastStep }) => (
        <VacancyStep
          stepNumber={2}
          isPastStep={isPastStep}
          idPrefix={ID_PREFIX}
          sharedCopy={buildVacancySelfTenantSharedCopy({
            vacancyYear: year0,
            leaseSinceYear: missingFromYear,
          })}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) =>
            patchGetsVacancyIncrease(value, onFormStateChange, "tookSuccession")
          }
        />
      ),
    },
    {
      id: "succession",
      stepNumber: 3,
      isVisible: isTenancyStartStepVisible,
      render: ({ isPastStep }) => (
        <SuccessionStep
          stepNumber={3}
          isPastStep={isPastStep}
          idPrefix={ID_PREFIX}
          sharedCopy={{ year: missingFromYear }}
          value={formState.tookSuccession}
          onChange={(value) => onFormStateChange({ tookSuccession: value })}
        />
      ),
    },
  ];
}
