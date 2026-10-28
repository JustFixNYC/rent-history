import { Fragment } from "react";
import { Checkbox } from "@justfixnyc/component-library";
import type { MessageDescriptor } from "@lingui/core";
import { useLingui } from "@lingui/react";

import {
  OcrLegalRentField,
  OcrPrefRentField,
} from "../fields/OcrFieldWrappers";
import type { Finding } from "../types/finding";

export type PrefRentOcrFieldKeys = {
  legalRent: string;
  prefRent: string;
  noPrefRent: string;
};

export type PrefRentOcrFieldsProps = {
  idPrefix: string;
  formRowIndex: number;
  wireRow: Finding["data"]["rows"][number] | undefined;
  legalRent: string;
  prefRent: string;
  noPrefRent: boolean;
  readonly: boolean;
  /** When true, legal rent stays read-only even while the step is editable. */
  legalRentReadonly?: boolean;
  /** When false, omits the “no preferential rent” checkbox (default true). */
  showNoPrefRentCheckbox?: boolean;
  noPrefRentLabel: MessageDescriptor;
  fieldKeys: PrefRentOcrFieldKeys;
  onFormStateChange: (patch: Record<string, string | boolean>) => void;
};

export function PrefRentOcrFields({
  idPrefix,
  formRowIndex,
  wireRow,
  legalRent,
  prefRent,
  noPrefRent,
  readonly,
  legalRentReadonly = false,
  showNoPrefRentCheckbox = true,
  noPrefRentLabel,
  fieldKeys,
  onFormStateChange,
}: PrefRentOcrFieldsProps) {
  const { _ } = useLingui();
  const prefRentReadonly = readonly || noPrefRent;
  const legalReadonly = readonly || legalRentReadonly;

  return (
    <Fragment>
      <OcrLegalRentField
        id={`${idPrefix}-ocr-rent-${formRowIndex}`}
        value={legalRent}
        onChange={(value) =>
          onFormStateChange({ [fieldKeys.legalRent]: value })
        }
        readonly={legalReadonly}
      />
      <OcrPrefRentField
        id={`${idPrefix}-ocr-pref-rent-${formRowIndex}`}
        value={prefRent}
        onChange={(value) => onFormStateChange({ [fieldKeys.prefRent]: value })}
        readonly={prefRentReadonly}
      />
      {showNoPrefRentCheckbox ? (
        <Checkbox
          id={`${idPrefix}-ocr-no-pref-rent-${formRowIndex}`}
          labelText={_(noPrefRentLabel)}
          checked={noPrefRent}
          disabled={readonly}
          onChange={(event) => {
            const checked = event.target.checked;
            onFormStateChange({
              [fieldKeys.noPrefRent]: checked,
              [fieldKeys.prefRent]: checked
                ? ""
                : wireRow?.pref_rent != null
                ? String(wireRow.pref_rent)
                : "",
            });
          }}
        />
      ) : null}
    </Fragment>
  );
}
