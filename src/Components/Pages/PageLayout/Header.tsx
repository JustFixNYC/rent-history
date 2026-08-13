import { Icon } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import classNames from "classnames";
import { Link } from "react-router-dom";
import "./Header.scss";

type HeaderProps = {
  isMobileMenuOpen: boolean;
  onMenuClick: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  isMobileMenuOpen,
  onMenuClick,
}) => {
  const { i18n, _ } = useLingui();

  return (
    <header
      id="topbar"
      className={classNames("header", {
        "header--menu-open": isMobileMenuOpen,
      })}
    >
      <div
        className={classNames("header__brand", {
          "header__brand--es": i18n.locale === "es",
        })}
      >
        <h1>
          <Link to={`/${i18n.locale}`}>
            <Trans>Rent History NYC</Trans>
          </Link>
        </h1>
      </div>
      <div
        className={classNames("header__menu", {
          "header__menu--open": isMobileMenuOpen,
        })}
      >
        <button
          className={classNames("header__menu-button", {
            "header__menu-button--close": isMobileMenuOpen,
          })}
          type="button"
          aria-label={isMobileMenuOpen ? _(msg`Close menu`) : _(msg`Open menu`)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="sidebar"
          onClick={onMenuClick}
        >
          {isMobileMenuOpen ? (
            <>
              <Icon icon="xmark" />
              <Trans>Close</Trans>
            </>
          ) : (
            <>
              <Icon icon="bars" />
              <Trans>Menu</Trans>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export const CollabHeader: React.FC = () => (
  <div className="collab-header">
    <Trans>
      <span>By</span>{" "}
      <a
        href="https://www.justfix.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        JustFix
      </a>
    </Trans>
  </div>
);
