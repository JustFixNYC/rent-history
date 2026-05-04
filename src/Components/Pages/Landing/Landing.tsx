import { Button, Icon } from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import "./Landing.scss";

const Landing: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  return (
    <div id="landing-page">
      <section className="landing-hero">
        <h1>
          <Trans>Find out if you’ve been overcharged on rent</Trans>
        </h1>
        <p>
          <Trans>
            Analyze your rent history to identify potential violations and
            overcharges.
          </Trans>
        </p>
        <Button
          labelText={_(msg`Get started`)}
          className="landing-hero__cta"
          onClick={() => navigate(`/${i18n.locale}/login`)}
        />
      </section>

      <section className="landing-about">
        <h2>
          <Trans>About this site</Trans>
        </h2>
        <p>
          <Trans>
            Landlords in NYC are required to follow strict rules about rent
            increases. This free tool analyzes your rent history to spot
            potential violations. Free to use, no password required, and your
            information stays private.
          </Trans>
        </p>
        <article className="landing-about__card">
          <h3>
            <Trans>JustFix</Trans>
          </h3>
          <p>
            <Trans>
              A non-profit that builds free tools for tenants to exercise their
              rights to a livable home.
            </Trans>
          </p>
          <a
            href="https://www.justfix.org"
            target="_blank"
            rel="noreferrer"
            className="landing-about__link"
          >
            <Trans>Learn more</Trans> <Icon icon="squareArrowUpRight" />
          </a>
        </article>
      </section>
    </div>
  );
};

export default Landing;
