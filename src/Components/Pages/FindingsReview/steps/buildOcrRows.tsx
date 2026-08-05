import { Fragment } from "react";

import {
  OcrAptStatField,
  OcrLegalRentField,
  OcrPrefRentField,
} from "../fields/OcrFieldWrappers";
import type { Finding } from "../types/finding";

import type { OcrConfirmRowConfig } from "./OcrConfirmStep";

export type OcrColumnField = "apt_stat" | "legal_rent" | "pref_rent";

export type OcrRowLayout = {
  /** Index into `finding.data.rows`. */
  dataRowIndex: number;
  /** 0-based slot for form keys (`row0AptStat`, `row1LegalRent`, …). */
  formRowIndex: number;
  left?: OcrColumnField;
  right?: OcrColumnField[];
};

export type BuildStandardOcrRowsParams<TForm extends Record<string, unknown>> =
  {
    finding: Finding;
    formState: TForm;
    onFormStateChange: (patch: Partial<TForm>) => void;
    /** Prefix for element ids, e.g. `prehstpa` → `prehstpa-ocr-apt-stat-0`. */
    idPrefix: string;
    rows: OcrRowLayout[];
  };

const FIELD_SUFFIX: Record<OcrColumnField, string> = {
  apt_stat: "AptStat",
  legal_rent: "LegalRent",
  pref_rent: "PrefRent",
};

const FIELD_ID_SEGMENT: Record<OcrColumnField, string> = {
  apt_stat: "apt-stat",
  legal_rent: "rent",
  pref_rent: "pref-rent",
};

function formFieldKey(formRowIndex: number, field: OcrColumnField): string {
  return `row${formRowIndex}${FIELD_SUFFIX[field]}`;
}

function renderOcrField(
  field: OcrColumnField,
  props: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    readonly: boolean;
  }
) {
  switch (field) {
    case "apt_stat":
      return <OcrAptStatField key={field} {...props} />;
    case "legal_rent":
      return <OcrLegalRentField key={field} {...props} />;
    case "pref_rent":
      return <OcrPrefRentField key={field} {...props} />;
  }
}

/** Build `OcrConfirmRowConfig[]` from declarative row/column layout. */
export function buildStandardOcrRows<TForm extends Record<string, unknown>>({
  finding,
  formState,
  onFormStateChange,
  idPrefix,
  rows,
}: BuildStandardOcrRowsParams<TForm>): OcrConfirmRowConfig[] {
  return rows.map((rowLayout) => {
    const wireRow = finding.data.rows[rowLayout.dataRowIndex];

    const renderColumn = (field: OcrColumnField, readonly: boolean) => {
      const key = formFieldKey(rowLayout.formRowIndex, field);
      const value = String(formState[key] ?? "");

      return renderOcrField(field, {
        id: `${idPrefix}-ocr-${FIELD_ID_SEGMENT[field]}-${rowLayout.formRowIndex}`,
        value,
        onChange: (nextValue) =>
          onFormStateChange({ [key]: nextValue } as Partial<TForm>),
        readonly,
      });
    };

    return {
      regYear: wireRow.reg_year,
      renderLeft: rowLayout.left
        ? ({ readonly }) => renderColumn(rowLayout.left!, readonly)
        : () => null,
      renderRight: rowLayout.right?.length
        ? ({ readonly }) => (
            <Fragment>
              {rowLayout.right!.map((field) => renderColumn(field, readonly))}
            </Fragment>
          )
        : () => null,
    };
  });
}
