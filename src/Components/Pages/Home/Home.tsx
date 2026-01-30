import { Trans } from "@lingui/react/macro";

import "./Home.scss";
import { LocaleLink } from "../../../i18n";

export const Home: React.FC = () => {
  return (
    <div id="home-page" className="page">
      <section className="page__hero">
        <h1>
          <Trans>Rent History Analyzer</Trans>
        </h1>
        <p>
          <Trans>
            Use your mobile phone's camera to scan your rent history document
            and analyze the contents to identify suspicious rent increases that
            may indicate illegal overcharges.
          </Trans>
        </p>
      </section>
      <div className="page__content">
        <LocaleLink to="scanner" className="jfcl-button jfcl-variant-primary">
          Scan your rent history
        </LocaleLink>
      </div>
    </div>
  );
};
