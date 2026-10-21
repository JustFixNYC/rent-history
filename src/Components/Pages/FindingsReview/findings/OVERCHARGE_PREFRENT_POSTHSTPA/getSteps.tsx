import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { buildPrefRentOcrRows } from "../../shared/buildPrefRentOcrRows";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { TenantNameTipsLink } from "../../shared/TenantNameTipsLink";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import {
  VacancyStep,
  buildVacancyTenantChangeSharedCopy,
} from "../../steps/VacancyStep";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { PrefrentPosthstpaFormState } from "./answers";
import { getIntroValues } from "./getIntro";
import { NO_PREF_RENT_LABEL } from "./ReviewCopy";
import { getTenancyRowTenants, ROW_INDEX } from "./spec";

const ID_PREFIX = "prefrent-posthstpa";

export type PrefrentPosthstpaGetStepsBindings = {
  finding: Finding;
  formState: PrefrentPosthstpaFormState;
  onFormStateChange: (patch: Partial<PrefrentPosthstpaFormState>) => void;
  ocrPhase?: OcrConfirmPhase;
  onOcrConfirm?: () => void;
  onOcrEdit?: () => void;
};

export function getSteps(
  bindings: PrefrentPosthstpaGetStepsBindings
): FindingStep[] {
  const {
    finding,
    formState,
    onFormStateChange,
    ocrPhase,
    onOcrConfirm,
    onOcrEdit,
  } = bindings;
  const ocrRows = buildPrefRentOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix: ID_PREFIX,
    noPrefRentLabel: NO_PREF_RENT_LABEL,
    rows: [
      {
        dataRowIndex: ROW_INDEX.row0,
        formRowIndex: 0,
        fieldKeys: {
          legalRent: "row0LegalRent",
          prefRent: "row0PrefRent",
          noPrefRent: "row0NoPrefRent",
        },
      },
      {
        dataRowIndex: ROW_INDEX.row1,
        formRowIndex: 1,
        fieldKeys: {
          legalRent: "row1LegalRent",
          prefRent: "row1PrefRent",
          noPrefRent: "row1NoPrefRent",
        },
        legalRentReadonly: true,
      },
    ],
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
          idPrefix={ID_PREFIX}
          sharedCopy={vacancySharedCopy}
          tenants={isMultiTenant ? tenants : undefined}
          tips={<TenantNameTipsLink />}
          getsVacancyIncrease={formState.getsVacancyIncrease}
          onGetsVacancyIncreaseChange={(value) => {
            onFormStateChange({ getsVacancyIncrease: value });
          }}
        />
      ),
    },
  ];
}
