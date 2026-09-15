import { useEffect, useState } from "react";
import { ButtonStyledLink, Icon } from "@justfixnyc/component-library";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useLocation } from "react-router-dom";

import { RequestForm } from "./RequestForm";
import {
  captureReferralFromSearchParams,
  clearStoredReferral,
  getStoredReferral,
  type ReferralPartner,
} from "./referralStorage";
import "./RequestPage.scss";

const RequestPage: React.FC = () => {
  const { i18n, _ } = useLingui();
  const location = useLocation();
  const locale = i18n.locale;
  const landingPath = `/${locale}`;
  const [referralPartner, setReferralPartner] =
    useState<ReferralPartner | null>(() => getStoredReferral());

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await captureReferralFromSearchParams(location.search);
      if (!cancelled) {
        setReferralPartner(getStoredReferral());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.search]);

  const handleReferralOptOut = () => {
    clearStoredReferral();
    setReferralPartner(null);
  };

  return (
    <div id="request-page" className="request-page">
      <section className="request-page__hero">
        <div className="request-page__hero-inner">
          <h1 className="request-page__title">
            <Trans>Request your rent history</Trans>
          </h1>
          <p className="request-page__subtitle">
            <Trans>
              Your rent history shows how your apartment&apos;s rent has changed
              over time. It can help you determine if your apartment is still
              rent stabilized or should be.
            </Trans>
          </p>
        </div>
      </section>

      <section className="request-page__section">
        <div className="request-page__section-inner">
          <p className="request-page__intro">
            <Trans>
              Request your rent history from DHCR for free. We&apos;ll use your
              information to help you submit the request. Your landlord will not
              be notified that you&apos;ve requested your rent history.
            </Trans>
          </p>

          <RequestForm
            referralPartner={referralPartner}
            onReferralOptOut={handleReferralOptOut}
          />

          <div className="request-page__or" aria-hidden="true">
            <span className="request-page__or-line" />
            <span className="request-page__or-label">
              <Trans>Or</Trans>
            </span>
            <span className="request-page__or-line" />
          </div>

          <div className="request-page__sms-cta">
            <div className="request-page__sms-cta-title">
              <Icon icon="mobileScreenButton" aria-hidden="true" />
              <p>
                <Trans>Text us to get your rent history document</Trans>
              </p>
            </div>
            <div className="request-page__sms-cta-body">
              <p>
                <Trans>
                  This is the same service as above, but accessible through text
                  message.
                </Trans>
              </p>
              <p className="request-page__sms-instruction">
                <Trans>
                  Text{" "}
                  <span className="request-page__emphasis">RENT HISTORY</span>{" "}
                  to{" "}
                  <span className="request-page__emphasis">(855) 610-2450</span>
                </Trans>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="request-page__section"
        id="request-faq"
        aria-labelledby="request-faq-heading"
      >
        <div className="request-page__section-inner">
          <div className="request-page__faq">
            <h2
              className="request-page__section-heading"
              id="request-faq-heading"
            >
              <Trans>What happens after you request your rent history?</Trans>
            </h2>
            <div className="request-page__faq-body">
              <p>
                <Trans>
                  If your apartment is currently rent stabilized, or has been at
                  any point in the past, you should receive your Rent History in
                  the mail in about a week.
                </Trans>
              </p>
              <p>
                <Trans>
                  If your apartment has never been rent stabilized, you will not
                  receive a rent history in the mail. The DHCR only has rent
                  histories for apartments that were rent stabilized at some
                  point in time.
                </Trans>
              </p>
            </div>
          </div>

          <div className="request-page__analyze-cta">
            <div className="request-page__analyze-cta-text">
              <p className="request-page__analyze-cta-heading">
                <Trans>Got your rent history?</Trans>
              </p>
              <p>
                <Trans>
                  Analyzing your rent history can help you understand how your
                  rent has changed over time and identify things that may need a
                  closer look.
                </Trans>
              </p>
            </div>
            <ButtonStyledLink
              className="request-page__analyze-button"
              variant="primary"
              href={landingPath}
              labelText={_(msg`Analyze your rent history`)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default RequestPage;
