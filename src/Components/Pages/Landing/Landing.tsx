import { LocaleLink } from "../../../i18n";
import "./Landing.scss";

const Landing: React.FC = () => {
  return (
    <div id="landing-page">
      <header className="landing-header">
        <div className="landing-header__brand">Rent History NYC</div>
        <button
          className="landing-header__menu"
          aria-label="Open menu"
          type="button"
        >
          <span className="landing-header__menu-icon" aria-hidden="true" />
          Menu
        </button>
      </header>

      <section className="landing-hero">
        <h1>Find out if you&apos;ve been overcharged on rent</h1>
        <p>
          Analyze your rent history to identify potential violations and
          overcharges.
        </p>
        <LocaleLink
          to="analyze"
          className="jfcl-button jfcl-variant-primary landing-hero__cta"
        >
          Get started
        </LocaleLink>
      </section>

      <section className="landing-about">
        <h2>About this site</h2>
        <p>
          Landlords in NYC are required to follow strict rules about rent
          increases. This free tool analyzes your rent history to spot potential
          violations. Free to use, no password required, and your information
          stays private.
        </p>
        <article className="landing-about__card">
          <h3>JustFix</h3>
          <p>
            A non-profit that builds free tools for tenants to exercise their
            rights to a livable home.
          </p>
          <a
            href="https://www.justfix.org"
            target="_blank"
            rel="noreferrer"
            className="landing-about__link"
          >
            Learn more
          </a>
        </article>
      </section>

      <footer className="landing-footer">
        <section className="landing-footer__disclaimer">
          <h3>Disclaimer</h3>
          <p>
            The information on this website does not constitute legal advice and
            must not be used as a substitute for the advice of a lawyer
            qualified to give advice on legal issues pertaining to housing.
          </p>
        </section>
        <nav className="landing-footer__links" aria-label="Legal and feedback">
          <LocaleLink to="privacy_policy">Privacy policy</LocaleLink>
          <LocaleLink to="terms_of_use">Terms of use</LocaleLink>
          <a href="https://www.justfix.org/contact/" target="_blank" rel="noreferrer">
            Feedback form
          </a>
        </nav>
        <section className="landing-footer__brand">
          <p className="landing-footer__title">Rent History NYC</p>
          <p>
            By{" "}
            <a href="https://housingjusticeforall.org" target="_blank" rel="noreferrer">
              Housing Justice for All
            </a>{" "}
            &amp;{" "}
            <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
              JustFix
            </a>
          </p>
        </section>
      </footer>
    </div>
  );
};

export default Landing;
