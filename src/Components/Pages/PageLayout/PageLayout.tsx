import { useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { I18n } from "../../../i18n";
import { CollabHeader, Header } from "./Header";
import { Footer } from "./Footer";
import { SidebarNav } from "./SidebarNav";
import "./PageLayout.scss";

export const PageLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <I18n>
      <div id="grid">
        <SidebarNav
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />
        <main id="main">
          <Header
            isMobileMenuOpen={isMobileMenuOpen}
            onMenuClick={() => setIsMobileMenuOpen((open) => !open)}
          />
          <div id="content">
            <div id="page">
              <CollabHeader />
              <Outlet />
              <Footer />
            </div>
          </div>
        </main>
      </div>

      <ScrollRestoration />
    </I18n>
  );
};
