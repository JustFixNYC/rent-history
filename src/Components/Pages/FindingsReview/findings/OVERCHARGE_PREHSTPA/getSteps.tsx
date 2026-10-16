import { isTenancyStartStepVisible } from "../../hooks/stepVisibility";
import { patchGetsVacancyIncrease } from "../../hooks/vacancyFormState";
import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { TenantNameTipsLink } from "../../shared/TenantNameTipsLink";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { TenancyStep, buildTenancySharedCopy } from "../../steps/TenancyStep";
import {
  VacancyStep,
  buildVacancyTenantChangeSharedCopy,
} from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { PrehstpaFormState } from "./answers";
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
  const ocrYears = ocrRows.map((row) => row.regYear);
  const vacancySharedCopy = buildVacancyTenantChangeSharedCopy({
    tenants,
    vacancyYear: year1,
    year0,
    year1,
  });
  const tenancySharedCopy = buildTenancySharedCopy(tenants);

  return [
    {
      id: "ocr_confirm",
      stepNumber: 1,
      render: ({ isPastStep }) => (
        <OcrConfirmStep
          stepNumber={1}
          intro={<OcrConfirmIntro years={ocrYears} />}
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
          sharedCopy={vacancySharedCopy}
          tenants={isMultiTenant ? tenants : undefined}
          tips={<TenantNameTipsLink />}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) =>
            patchGetsVacancyIncrease(value, onFormStateChange, "tenancyStart")
          }
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
          sharedCopy={tenancySharedCopy}
          tips={<TenantNameTipsLink />}
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
