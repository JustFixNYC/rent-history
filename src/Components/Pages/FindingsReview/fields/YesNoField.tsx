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
  /** When true, omit the visible fieldset legend (question lives in step body). */
  hideLegend?: boolean;
  /** Required when `hideLegend` — names the radiogroup for assistive tech. */
  questionAriaLabel?: string;
  /** Alternative to `questionAriaLabel` — references an element that labels the group. */
  ariaLabelledBy?: string;
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
  hideLegend = false,
  questionAriaLabel,
  ariaLabelledBy,
}) => {
  const { _ } = useLingui();
  const resolvedYesLabel = yesLabel ?? _(msg`Yes`);
  const resolvedNoLabel = noLabel ?? _(msg`No`);

  const options = (
    <fieldset
      disabled={disabled}
      className="findings-review-yes-no-field__options-fieldset"
    >
      <div
        className="findings-review-yes-no-field__options"
        role="radiogroup"
        aria-label={hideLegend ? questionAriaLabel : undefined}
        aria-labelledby={hideLegend ? ariaLabelledBy : undefined}
      >
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
    </fieldset>
  );

  if (hideLegend) {
    return (
      <div
        className={classNames("findings-review-yes-no-field", className)}
        data-hide-legend="true"
      >
        {options}
      </div>
    );
  }

  return (
    <FormGroup
      legendText={labelText}
      className={classNames("findings-review-yes-no-field", className)}
      invalid={invalid}
      invalidText={invalidText}
    >
      {options}
    </FormGroup>
  );
};
