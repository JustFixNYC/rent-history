import { Fragment } from "react";
import { Checkbox } from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";

import {
  OcrLegalRentField,
  OcrPrefRentField,
} from "../../fields/OcrFieldWrappers";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { VacancyStep } from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import {
  VacancyBody,
  VacancyYesNoLegend,
} from "../OVERCHARGE_PREHSTPA/ReviewCopy";
import { VacancyHeading } from "../OVERCHARGE_PREFRENT_POSTHSTPA/ReviewCopy";

import type { PrefrentremovedPosthstpaFormState } from "./answers";
import { NO_PREF_RENT_LABEL, OcrHeading } from "./ReviewCopy";
import { getIntroValues } from "./getIntro";
import { ROW_INDEX } from "./spec";

export type PrefrentremovedPosthstpaGetStepsBindings = {
  finding: Finding;
  formState: PrefrentremovedPosthstpaFormState;
  onFormStateChange: (
    patch: Partial<PrefrentremovedPosthstpaFormState>
  ) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const ID_PREFIX = "prefrentremoved-posthstpa";

type OcrRow1RightColumnProps = {
  finding: Finding;
  formState: PrefrentremovedPosthstpaFormState;
  onFormStateChange: (
    patch: Partial<PrefrentremovedPosthstpaFormState>
  ) => void;
  readonly: boolean;
};

const OcrRow1RightColumn = ({
  finding,
  formState,
  onFormStateChange,
  readonly,
}: OcrRow1RightColumnProps) => {
  const { _ } = useLingui();
  const wireRow = finding.data.rows[ROW_INDEX.row1];
  const prefRentReadonly = readonly || formState.row1NoPrefRent;

  return (
    <Fragment>
      <OcrLegalRentField
        id={`${ID_PREFIX}-ocr-rent-1`}
        value={formState.row1LegalRent}
        onChange={(value) => onFormStateChange({ row1LegalRent: value })}
        readonly={readonly}
      />
      <OcrPrefRentField
        id={`${ID_PREFIX}-ocr-pref-rent-1`}
        value={formState.row1PrefRent}
        onChange={(value) => onFormStateChange({ row1PrefRent: value })}
        readonly={prefRentReadonly}
      />
      <Checkbox
        id={`${ID_PREFIX}-ocr-no-pref-rent-1`}
        labelText={_(NO_PREF_RENT_LABEL)}
        checked={formState.row1NoPrefRent}
        disabled={readonly}
        onChange={(event) => {
          const checked = event.target.checked;
          onFormStateChange({
            row1NoPrefRent: checked,
            row1PrefRent: checked
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
    dataRowIndex: ROW_INDEX.row0,
    formRowIndex: 0,
    left: "apt_stat" as const,
    right: ["legal_rent" as const, "pref_rent" as const],
  },
  {
    dataRowIndex: ROW_INDEX.row1,
    formRowIndex: 1,
    left: "apt_stat" as const,
  },
];

export function getSteps(
  bindings: PrefrentremovedPosthstpaGetStepsBindings
): FindingStep[] {
  const {
    finding,
    formState,
    onFormStateChange,
    ocrPhase,
    onOcrConfirm,
    onOcrEdit,
  } = bindings;
  const [ocrRow0, ocrRow1Base] = buildStandardOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix: ID_PREFIX,
    rows: STANDARD_OCR_ROWS,
  });
  const ocrRows = [
    ocrRow0,
    {
      ...ocrRow1Base,
      renderRight: ({ readonly }: { readonly: boolean }) => (
        <OcrRow1RightColumn
          finding={finding}
          formState={formState}
          onFormStateChange={onFormStateChange}
          readonly={readonly}
        />
      ),
    },
  ];
  const { year0, year1 } = getIntroValues(finding);

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
    {
      id: "vacancy",
      stepNumber: 2,
      render: ({ isPastStep }) => (
        <VacancyStep
          stepNumber={2}
          isPastStep={isPastStep}
          idPrefix={ID_PREFIX}
          title={<VacancyHeading year0={year0} year1={year1} />}
          body={<VacancyBody year0={year0} year1={year1} />}
          yesNoLegend={<VacancyYesNoLegend />}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) => {
            onFormStateChange({ getsVacancyIncrease: value });
          }}
        />
      ),
    },
  ];
}
