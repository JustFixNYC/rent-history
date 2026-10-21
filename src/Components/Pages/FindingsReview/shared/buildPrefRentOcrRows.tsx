import type { MessageDescriptor } from "@lingui/core";

import type { OcrConfirmRowConfig } from "../steps/OcrConfirmStep";
import { buildStandardOcrRows } from "../steps/buildOcrRows";
import type { Finding } from "../types/finding";

import {
  PrefRentOcrFields,
  type PrefRentOcrFieldKeys,
} from "./PrefRentOcrFields";

export type PrefRentOcrRowSpec = {
  dataRowIndex: number;
  formRowIndex: number;
  fieldKeys: PrefRentOcrFieldKeys;
  legalRentReadonly?: boolean;
  showNoPrefRentCheckbox?: boolean;
};

export type BuildPrefRentOcrRowsParams<TForm extends Record<string, unknown>> =
  {
    finding: Finding;
    formState: TForm;
    onFormStateChange: (patch: Partial<TForm>) => void;
    idPrefix: string;
    rows: PrefRentOcrRowSpec[];
    noPrefRentLabel: MessageDescriptor;
  };

/** Apt stat (left) + legal / pref / optional no-pref checkbox (right) per row. */
export function buildPrefRentOcrRows<TForm extends Record<string, unknown>>({
  finding,
  formState,
  onFormStateChange,
  idPrefix,
  rows,
  noPrefRentLabel,
}: BuildPrefRentOcrRowsParams<TForm>): OcrConfirmRowConfig[] {
  const baseRows = buildStandardOcrRows({
    finding,
    formState,
    onFormStateChange,
    idPrefix,
    rows: rows.map((row) => ({
      dataRowIndex: row.dataRowIndex,
      formRowIndex: row.formRowIndex,
      left: "apt_stat" as const,
    })),
  });

  return baseRows.map((ocrRow, index) => {
    const spec = rows[index];
    const wireRow = finding.data.rows[spec.dataRowIndex];
    const { fieldKeys, formRowIndex } = spec;

    return {
      ...ocrRow,
      renderRight: ({ readonly }: { readonly: boolean }) => (
        <PrefRentOcrFields
          idPrefix={idPrefix}
          formRowIndex={formRowIndex}
          wireRow={wireRow}
          legalRent={String(formState[fieldKeys.legalRent] ?? "")}
          prefRent={String(formState[fieldKeys.prefRent] ?? "")}
          noPrefRent={Boolean(formState[fieldKeys.noPrefRent])}
          readonly={readonly}
          legalRentReadonly={spec.legalRentReadonly}
          showNoPrefRentCheckbox={spec.showNoPrefRentCheckbox}
          noPrefRentLabel={noPrefRentLabel}
          fieldKeys={fieldKeys}
          onFormStateChange={(patch) =>
            onFormStateChange(patch as Partial<TForm>)
          }
        />
      ),
    };
  });
}
