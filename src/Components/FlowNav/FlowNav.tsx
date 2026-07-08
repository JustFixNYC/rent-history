import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";
import { Button, Icon, LinkStyledButton } from "@justfixnyc/component-library";

import "./FlowNav.scss";

export type FlowNavProps = {
  onBack: () => void;
  onNext: () => void;
  isNextLoading?: boolean;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  backLabel?: ReactNode;
  nextLabel?: string;
  ariaLabel?: string;
  className?: string;
};

export const FlowNav = ({
  onBack,
  onNext,
  isNextLoading = false,
  backDisabled = false,
  nextDisabled = false,
  backLabel,
  nextLabel,
  ariaLabel,
  className,
}: FlowNavProps) => {
  const { _ } = useLingui();
  const resolvedBackLabel = backLabel ?? <Trans>Back</Trans>;
  const resolvedNextLabel = nextLabel ?? _(msg`Submit`);
  const resolvedAriaLabel = ariaLabel ?? _(msg`Navigation`);
  const navClassName = className ? `flow-nav ${className}` : "flow-nav";

  return (
    <nav
      className={navClassName}
      aria-label={resolvedAriaLabel}
      data-testid="flow-nav"
    >
      <LinkStyledButton
        className="flow-nav__back"
        onClick={onBack}
        disabled={isNextLoading || backDisabled}
      >
        <Icon icon="chevronLeft" aria-hidden="true" />
        {resolvedBackLabel}
      </LinkStyledButton>
      <Button
        className="flow-nav__next"
        labelText={resolvedNextLabel}
        loading={isNextLoading}
        disabled={isNextLoading || nextDisabled}
        onClick={onNext}
      />
    </nav>
  );
};
