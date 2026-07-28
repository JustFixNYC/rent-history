import classNames from "classnames";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { Link } from "react-router-dom";
import { LocaleSwitcher } from "../../../i18n";
import { AppNavItems } from "./AppNavItems";
import "./SidebarNav.scss";

type SidebarNavProps = {
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
};

const NamePlate: React.FC = () => {
  const { i18n } = useLingui();
  const isSpanish = i18n.locale === "es";

  return (
    <div
      className={classNames("sidebar-nav__nameplate", {
        "sidebar-nav__nameplate--es": isSpanish,
      })}
    >
      <p className="sidebar-nav__brand-title">
        <Link to={`/${i18n.locale}`}>
          <Trans>Rent History NYC</Trans>
        </Link>
      </p>
    </div>
  );
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
  isMobileMenuOpen = false,
  onCloseMobileMenu,
}) => {
  return (
    <aside
      id="sidebar"
      className={classNames("sidebar-nav", {
        "sidebar-nav--mobile-open": isMobileMenuOpen,
      })}
    >
      <div className="sidebar-nav__content">
        <NamePlate />
        <AppNavItems
          className="sidebar-nav__items"
          onNavigate={onCloseMobileMenu}
        />
        <div className="sidebar-nav__locale">
          <p className="sidebar-nav__locale-label">
            <Trans>Language</Trans>
          </p>
          <LocaleSwitcher />
        </div>
      </div>
    </aside>
  );
};
