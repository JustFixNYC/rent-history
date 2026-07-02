import { Icon } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import classNames from "classnames";
import { NavLink, useLocation } from "react-router-dom";
import { getAppNavActiveStates } from "./appNavActive";
import "./AppNavItems.scss";

type AppNavItemsProps = {
  className?: string;
  onNavigate?: () => void;
};

export const AppNavItems: React.FC<AppNavItemsProps> = ({
  className,
  onNavigate,
}) => {
  const { i18n, _ } = useLingui();
  const { pathname } = useLocation();
  const { isHomeActive, isAboutActive } = getAppNavActiveStates(pathname);

  return (
    <nav
      className={classNames("app-nav-items", className)}
      aria-label={_(msg`Site navigation`)}
    >
      <ul className="app-nav-items__list">
        <li
          className={classNames("app-nav-items__item", {
            "app-nav-items__item--active": isHomeActive,
          })}
        >
          <NavLink
            to={`/${i18n.locale}`}
            className="app-nav-items__link"
            aria-current={isHomeActive ? "page" : undefined}
            onClick={onNavigate}
          >
            <Icon icon="house" className="app-nav-items__icon" />
            <Trans>Find out if you&apos;ve been overcharged</Trans>
          </NavLink>
        </li>
        <li
          className={classNames("app-nav-items__item", {
            "app-nav-items__item--active": isAboutActive,
          })}
        >
          <NavLink
            to={`/${i18n.locale}/about`}
            className="app-nav-items__link"
            aria-current={isAboutActive ? "page" : undefined}
            onClick={onNavigate}
          >
            <Icon icon="calculatorSimple" className="app-nav-items__icon" />
            <Trans>About</Trans>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
