import type { OcrConfirmPhase } from "../../hooks/useOcrConfirmState";
import { OcrConfirmStep } from "../../steps/OcrConfirmStep";
import { TenancyStep } from "../../steps/TenancyStep";
import { buildStandardOcrRows } from "../../steps/buildOcrRows";
import type { Finding } from "../../types/finding";
import type { FindingStep } from "../../types/step";

import {
  TenancyBody,
  TenancyBodyMultiple,
  TenancyHeading,
} from "../OVERCHARGE_PREHSTPA/ReviewCopy";

import type { HrvdFormState } from "./answers";
import { OcrHeading } from "./ReviewCopy";
import { getTenancyRowTenants, ROW_INDEX } from "./spec";

export type HrvdGetStepsBindings = {
  finding: Finding;
  formState: HrvdFormState;
  onFormStateChange: (patch: Partial<HrvdFormState>) => void;
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
];

export function getSteps(bindings: HrvdGetStepsBindings): FindingStep[] {
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
    idPrefix: "hrvd",
    rows: STANDARD_OCR_ROWS,
  });
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
      id: "tenancy_start",
      stepNumber: 2,
      render: ({ isPastStep }) => (
        <TenancyStep
          stepNumber={2}
          isPastStep={isPastStep}
          idPrefix="hrvd"
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
