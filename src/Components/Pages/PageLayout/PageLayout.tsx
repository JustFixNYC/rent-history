import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { I18n } from "../../../i18n";
import { AppScrollProvider, ScrollToTopOnRouteChange } from "../../../scroll";
import { CollabHeader, Header } from "./Header";
import { Footer } from "./Footer";
import { SidebarNav } from "./SidebarNav";
import "./PageLayout.scss";

export const PageLayout: React.FC = () => {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
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
      <AppScrollProvider containerRef={mainRef}>
        <ScrollToTopOnRouteChange />
        <div id="grid">
          <SidebarNav
            isMobileMenuOpen={isMobileMenuOpen}
            onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
          />
          <main id="main" ref={mainRef}>
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
      </AppScrollProvider>
    </I18n>
  );
};
