import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { PrefRentOcrFields } from "../../shared/PrefRentOcrFields";
import { OcrConfirmIntro } from "../../shared/stepCopy";
import { TenantNameTipsLink } from "../../shared/TenantNameTipsLink";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import {
  VacancyStep,
  buildVacancyTenantChangeSharedCopy,
} from "../../steps/VacancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import type { PrefrentremovedPosthstpaFormState } from "./answers";
import { NO_PREF_RENT_LABEL } from "./ReviewCopy";
import { getIntroValues } from "./getIntro";
import { getTenancyRowTenants, ROW_INDEX } from "./spec";

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

const PREF_RENT_OCR_FIELD_KEYS_ROW1 = {
  legalRent: "row1LegalRent",
  prefRent: "row1PrefRent",
  noPrefRent: "row1NoPrefRent",
} as const;

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
  const wireRow1 = finding.data.rows[ROW_INDEX.row1];
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
        <PrefRentOcrFields
          idPrefix={ID_PREFIX}
          formRowIndex={1}
          wireRow={wireRow1}
          legalRent={formState.row1LegalRent}
          prefRent={formState.row1PrefRent}
          noPrefRent={formState.row1NoPrefRent}
          readonly={readonly}
          noPrefRentLabel={NO_PREF_RENT_LABEL}
          fieldKeys={PREF_RENT_OCR_FIELD_KEYS_ROW1}
          onFormStateChange={(patch) =>
            onFormStateChange(
              patch as Partial<PrefrentremovedPosthstpaFormState>
            )
          }
        />
      ),
    },
  ];
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
