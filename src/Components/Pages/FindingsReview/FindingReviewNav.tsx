import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, Icon } from "@justfixnyc/component-library";

export type FindingReviewNavProps = {
  onBack: () => void;
  onNext: () => void;
  isValidating?: boolean;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
};

export const FindingReviewNav = ({
  onBack,
  onNext,
  isValidating = false,
  backDisabled = false,
  nextDisabled = false,
  nextLabel,
}: FindingReviewNavProps) => {
  const { _ } = useLingui();
  const resolvedNextLabel = nextLabel ?? _(msg`Next`);

  return (
    <nav
      className="finding-review-nav"
      aria-label={_(msg`Finding review navigation`)}
      data-testid="finding-review-nav"
    >
      <button
        type="button"
        className="finding-review-nav__back"
        onClick={onBack}
        disabled={isValidating || backDisabled}
      >
        <Icon icon="chevronLeft" aria-hidden="true" />
        <Trans>Back</Trans>
      </button>
      <Button
        className="finding-review-nav__next"
        labelText={resolvedNextLabel}
        labelIcon={isValidating ? "spinner" : undefined}
        disabled={isValidating || nextDisabled}
        onClick={onNext}
      />
    </nav>
  );
};
