import { isTenancyStartStepVisible } from "../../hooks/stepVisibility";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { TenancyStep } from "../../steps/TenancyStep";
import { VacancyStep } from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { PrehstpaFormState } from "./answers";
import {
  OcrHeading,
  TenancyBody,
  TenancyBodyMultiple,
  TenancyHeading,
  VacancyBody,
  VacancyHeading,
  VacancyYesNoLegend,
} from "./ReviewCopy";
import { getIntroValues } from "./getIntro";
import { getTenancyRowTenants, ROW_INDEX } from "./spec";

export type PrehstpaGetStepsBindings = {
  finding: Finding;
  formState: PrehstpaFormState;
  onFormStateChange: (patch: Partial<PrehstpaFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

const STANDARD_OCR_ROWS = [
  {
    dataRowIndex: ROW_INDEX.tenancy,
    formRowIndex: 0,
    left: "apt_stat" as const,
    right: ["legal_rent" as const],
  },
  {
    dataRowIndex: ROW_INDEX.vacancy,
    formRowIndex: 1,
    left: "apt_stat" as const,
    right: ["legal_rent" as const],
  },
];

export function getSteps(bindings: PrehstpaGetStepsBindings): FindingStep[] {
  const {
    finding,
    formState,
    onFormStateChange,
    ocrPhase,
    onOcrConfirm,
    onOcrEdit,
  } = bindings;
  const ocrRows = buildStandardOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix: "prehstpa",
    rows: STANDARD_OCR_ROWS,
  });
  const { year0, year1 } = getIntroValues(finding);
  const tenants = getTenancyRowTenants(finding);
  const isMultiTenant = tenants.length > 1;

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
          idPrefix="prehstpa"
          title={<VacancyHeading />}
          body={<VacancyBody year0={year0} year1={year1} />}
          yesNoLegend={<VacancyYesNoLegend />}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) => {
            if (value === false) {
              onFormStateChange({
                getsVacancyIncrease: false,
                tenancyStart: null,
              });
              return;
            }
            onFormStateChange({ getsVacancyIncrease: value });
          }}
        />
      ),
    },
    {
      id: "tenancy_start",
      stepNumber: 3,
      isVisible: isTenancyStartStepVisible,
      render: ({ isPastStep }) => (
        <TenancyStep
          stepNumber={3}
          isPastStep={isPastStep}
          idPrefix="prehstpa"
          title={<TenancyHeading />}
          body={
            isMultiTenant ? (
              <TenancyBodyMultiple />
            ) : (
              <TenancyBody tenant={tenants[0] ?? ""} />
            )
          }
          tenants={tenants}
          tenancyStart={formState.tenancyStart}
          onTenancyStartChange={(value) =>
            onFormStateChange({ tenancyStart: value })
          }
        />
      ),
    },
  ];
}
