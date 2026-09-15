import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useLocation } from "react-router-dom";
import { LocaleSwitcher } from "../../../i18n";
import { LocaleLink } from "../../RouterLinks";
import { isAnalyzeRoute } from "../../../routes/analyzeRoutes";
import "./Footer.scss";

export const Footer: React.FC = () => {
  const { _ } = useLingui();
  const location = useLocation();
  const isAnalyze = isAnalyzeRoute(location.pathname);

  return (
    <footer
      className={`site-footer${isAnalyze ? " site-footer--analyze" : ""}`}
    >
      <div className="site-footer__inner">
        {isAnalyze ? (
          <div className="site-footer__language">
            <span>
              <Trans>Language:</Trans>
            </span>
            <LocaleSwitcher />
          </div>
        ) : null}

        <div className={isAnalyze ? "site-footer__main-row" : undefined}>
          <section className="site-footer__disclaimer">
            <h3>
              <Trans>Legal Disclaimer</Trans>
            </h3>
            <p>
              <Trans>
                The information on this page is not legal advice and is not a
                substitute for advice from a lawyer.
              </Trans>
              {isAnalyze ? (
                <>
                  {" "}
                  <Trans>
                    Results are based on information found in your rent history
                    and the answers you provide.
                  </Trans>
                </>
              ) : null}
            </p>
          </section>

          <nav
            className="site-footer__links"
            aria-label={_(msg`Legal and feedback`)}
          >
            <LocaleLink to="privacy_policy">
              <Trans>Privacy policy</Trans>
            </LocaleLink>
            <LocaleLink to="terms-of-use">
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
        </div>

        <section className="site-footer__brand">
          <div className="site-footer__brand-row">
            <p className="site-footer__title">
              {isAnalyze ? (
                <Trans>Stabilized NYC</Trans>
              ) : (
                <Trans>Rent History NYC</Trans>
              )}
            </p>
            <p className="site-footer__brand-attribution">
              {isAnalyze ? (
                <Trans>
                  By{" "}
                  <a
                    href="https://www.justfix.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    JustFix
                  </a>
                  , a housing justice nonprofit
                </Trans>
              ) : (
                <>
                  <Trans>By</Trans>{" "}
                  <a
                    href="https://www.justfix.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Trans>JustFix</Trans>
                  </a>
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </footer>
  );
};
