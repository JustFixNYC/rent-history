import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { AptStatField } from "./AptStatField";
import { CurrencyField } from "./CurrencyField";

export type OcrFieldWrapperProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  readonly: boolean;
};

export const OcrAptStatField = ({
  id,
  value,
  onChange,
  readonly,
}: OcrFieldWrapperProps) => {
  const { _ } = useLingui();

  return (
    <AptStatField
      id={id}
      labelText={_(msg`Apt Stat`)}
      value={value}
      onChange={onChange}
      readonly={readonly}
    />
  );
};

export const OcrLegalRentField = ({
  id,
  value,
  onChange,
  readonly,
}: OcrFieldWrapperProps) => {
  const { _ } = useLingui();

  return (
    <CurrencyField
      id={id}
      labelText={_(msg`Legal Regulated Rent`)}
      value={value}
      onChange={onChange}
      readonly={readonly}
    />
  );
};

export const OcrPrefRentField = ({
  id,
  value,
  onChange,
  readonly,
}: OcrFieldWrapperProps) => {
  const { _ } = useLingui();

  return (
    <CurrencyField
      id={id}
      labelText={_(msg`Preferential Rent`)}
      value={value}
      onChange={onChange}
      readonly={readonly}
    />
  );
};
