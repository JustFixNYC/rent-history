import { Icon } from "@justfixnyc/component-library";
import type { IconProps } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import classNames from "classnames";
import { NavLink, useLocation } from "react-router-dom";

import { rentHistoryRequestUrl } from "../RightsPages/shared/rightsUrls";
import { getAppNavActiveStates } from "./appNavActive";
import "./AppNavItems.scss";

type AppNavItemsProps = {
  className?: string;
  onNavigate?: () => void;
};

type NavItemId = "request" | "analyze" | "know" | "assert";

type NavItemConfig = {
  id: NavItemId;
  icon: IconProps["icon"];
  label: ReturnType<typeof msg>;
};

const NAV_ITEMS: NavItemConfig[] = [
  {
    id: "request",
    icon: "mailboxOpenLetter",
    label: msg`Request your rent history`,
  },
  {
    id: "analyze",
    icon: "calculatorSimple",
    label: msg`Analyze your rent history`,
  },
  {
    id: "know",
    icon: "shieldCheck",
    label: msg`Know your rights`,
  },
  {
    id: "assert",
    icon: "handFist",
    label: msg`Assert your rights`,
  },
];

export const AppNavItems: React.FC<AppNavItemsProps> = ({
  className,
  onNavigate,
}) => {
  const { i18n, _ } = useLingui();
  const { pathname } = useLocation();
  const locale = i18n.locale;
  const activeStates = getAppNavActiveStates(pathname);

  const isItemActive = (id: NavItemId): boolean => {
    switch (id) {
      case "request":
        return false;
      case "analyze":
        return activeStates.isAnalyzeActive;
      case "know":
        return activeStates.isKnowYourRightsActive;
      case "assert":
        return activeStates.isAssertYourRightsActive;
      default:
        return false;
    }
  };

  return (
    <nav
      className={classNames("app-nav-items", className)}
      aria-label={_(msg`Site navigation`)}
    >
      <ul className="app-nav-items__list">
        {NAV_ITEMS.map((item) => {
          const isActive = isItemActive(item.id);
          const label = _(item.label);

          if (item.id === "request") {
            return (
              <li
                key={item.id}
                className={classNames("app-nav-items__item", {
                  "app-nav-items__item--active": isActive,
                })}
              >
                <a
                  href={rentHistoryRequestUrl(locale)}
                  className="app-nav-items__link"
                  target="_blank"
                  rel="noreferrer"
                  onClick={onNavigate}
                >
                  <Icon icon={item.icon} className="app-nav-items__icon" />
                  {label}
                </a>
              </li>
            );
          }

          const to =
            item.id === "analyze"
              ? `/${locale}`
              : item.id === "know"
              ? `/${locale}/know-your-rights`
              : `/${locale}/assert-your-rights`;

          return (
            <li
              key={item.id}
              className={classNames("app-nav-items__item", {
                "app-nav-items__item--active": isActive,
              })}
            >
              <NavLink
                to={to}
                className="app-nav-items__link"
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
              >
                <Icon icon={item.icon} className="app-nav-items__icon" />
                {label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
