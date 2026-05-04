import { Icon } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import "./Header.scss";

export const Header: React.FC = () => {
  const { _ } = useLingui();

  return (
    <header className="preflow-header">
      <div className="preflow-header__brand">
        <Trans>Rent History NYC</Trans>
      </div>
      <button
        className="preflow-header__menu"
        type="button"
        aria-label={_(msg`Menu`)}
      >
        <Icon icon="bars" />
        <Trans>Menu</Trans>
      </button>
    </header>
  );
};
