import classNames from "classnames";
import { FormGroup, SelectButton } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

export type YesNoFieldProps = {
  id: string;
  labelText: React.ReactNode;
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  className?: string;
  invalid?: boolean;
  invalidText?: string;
  disabled?: boolean;
};

export const YesNoField: React.FC<YesNoFieldProps> = ({
  id,
  labelText,
  value,
  onChange,
  yesLabel,
  noLabel,
  className,
  invalid,
  invalidText,
  disabled = false,
}) => {
  const { _ } = useLingui();
  const resolvedYesLabel = yesLabel ?? _(msg`Yes`);
  const resolvedNoLabel = noLabel ?? _(msg`No`);

  return (
    <FormGroup
      legendText={labelText}
      className={classNames("findings-review-yes-no-field", className)}
      invalid={invalid}
      invalidText={invalidText}
    >
      <div className="findings-review-yes-no-field__options" role="radiogroup">
        <SelectButton
          id={`${id}-yes`}
          name={id}
          className="findings-review-yes-no-field__option"
          labelText={resolvedYesLabel}
          value="true"
          checked={value === true}
          disabled={disabled}
          onChange={() => onChange(true)}
        />
        <SelectButton
          id={`${id}-no`}
          name={id}
          className="findings-review-yes-no-field__option"
          labelText={resolvedNoLabel}
          value="false"
          checked={value === false}
          disabled={disabled}
          onChange={() => onChange(false)}
        />
      </div>
    </FormGroup>
  );
};
