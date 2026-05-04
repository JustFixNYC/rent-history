import { Outlet, ScrollRestoration } from "react-router-dom";
import { I18n } from "../../../i18n";
import { Footer } from "./Footer";
import { Header } from "./Header";
import "./PageLayout.scss";

export const PageLayout: React.FC = () => (
  <I18n>
    <div id="container">
      <main id="main">
        <div id="content">
          <div id="pref-low-page">
            <Header />
            <Outlet />
            <Footer />
          </div>
        </div>
      </main>

      <ScrollRestoration />
    </div>
  </I18n>
);
