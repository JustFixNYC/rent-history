import { Trans } from "@lingui/react/macro";
import "./AboutPage.scss";

const AboutPage: React.FC = () => (
  <section className="about-page preflow-section">
    <h1 className="preflow-title">
      <Trans>About</Trans>
    </h1>
    <p className="about-page__message">
      <Trans>Coming soon.</Trans>
    </p>
  </section>
);

export default AboutPage;
