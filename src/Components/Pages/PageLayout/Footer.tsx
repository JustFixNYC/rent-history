import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { LocaleLink } from "../../../i18n";
import "./Footer.scss";

export const Footer: React.FC = () => {
  const { _ } = useLingui();

  return (
    <footer className="preflow-footer">
      <section className="preflow-footer__disclaimer">
        <h3>
          <Trans>Disclaimer</Trans>
        </h3>
        <p>
          <Trans>
            The information on this website does not constitute legal advice and
            must not be used as a substitute for the advice of a lawyer
            qualified to give advice on legal issues pertaining to housing.
          </Trans>
        </p>
      </section>
      <nav
        className="preflow-footer__links"
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
      <section className="preflow-footer__brand">
        <p className="preflow-footer__title">
          <Trans>Rent History NYC</Trans>
        </p>
        <p>
          <Trans>By</Trans>{" "}
          <a href="https://www.justfix.org" target="_blank" rel="noreferrer">
            <Trans>JustFix</Trans>
          </a>
        </p>
      </section>
    </footer>
  );
};
