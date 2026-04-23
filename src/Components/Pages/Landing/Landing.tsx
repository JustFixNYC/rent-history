import { Button, Icon } from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import { LocaleLink } from "../../../i18n";
import "./Landing.scss";

const Landing: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();

  return (
    <div id="landing-page">
      <header className="landing-header">
        <div className="landing-header__brand">
          <Trans>Rent History NYC</Trans>
        </div>
        <button
          className="landing-header__menu"
          aria-label={_(msg`Open menu`)}
          type="button"
        >
          <Icon icon="bars" />
          <Trans>Menu</Trans>
        </button>
      </header>

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
          onClick={() => navigate(`/${i18n.locale}/pre-flow`)}
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

      <footer className="landing-footer">
        <section className="landing-footer__disclaimer">
          <h3>
            <Trans>Disclaimer</Trans>
          </h3>
          <p>
            <Trans>
              The information on this website does not constitute legal advice
              and must not be used as a substitute for the advice of a lawyer
              qualified to give advice on legal issues pertaining to housing.
            </Trans>
          </p>
        </section>
        <nav
          className="landing-footer__links"
          aria-label={_(msg`Legal and feedback`)}
        >
          <LocaleLink to="privacy_policy">
            <Trans>Privacy policy</Trans>
          </LocaleLink>
          <LocaleLink to="terms_of_use">
            <Trans>Terms of use</Trans>
          </LocaleLink>
          <a
            href="https://www.justfix.org/en/contact-us"
            target="_blank"
            rel="noreferrer"
          >
            <Trans>Feedback form</Trans>
          </a>
        </nav>
        <section className="landing-footer__brand">
          <p className="landing-footer__title">
            <Trans>Rent History NYC</Trans>
          </p>
          <p>
            <Trans>By</Trans>{" "}
            <a
              href="https://housingjusticeforall.org"
              target="_blank"
              rel="noreferrer"
            >
              <Trans>Housing Justice for All</Trans>
            </a>{" "}
            &amp;{" "}
            <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
              <Trans>JustFix</Trans>
            </a>
          </p>
        </section>
      </footer>
    </div>
  );
};

export default Landing;
