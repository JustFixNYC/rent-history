import {
  ButtonStyledLink,
  CalloutBox,
  Link,
} from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";

import { StepNumberBadge } from "../../StepNumberBadge/StepNumberBadge";
import "./Landing.scss";

const Landing: React.FC = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const locale = i18n.locale;

  const loginPath = `/${locale}/login`;
  const aboutPath = `/${locale}/about`;
  const rentHistoryRequestUrl = `https://app.justfix.org/${locale}/rh`;
  const justfixUrl = `https://www.justfix.org/${locale}`;

  const navigateWithin =
    (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigate(path);
    };

  return (
    <div id="landing-page">
      <section className="landing-hero">
        <div className="landing-hero__inner">
          <h1 className="landing-hero__title">
            <Trans>Find out if you’ve been overcharged on rent</Trans>
          </h1>
          <div className="landing-hero__body">
            <p>
              <Trans>
                If your apartment is rent stabilized, or has ever been rent
                stabilized, you should have a rent history document.
              </Trans>
            </p>
            <p>
              <Trans>
                We’ll analyze it for signs of overcharges and illegal
                deregulations and tell you what it could mean for you.
              </Trans>
            </p>
          </div>
          <div className="landing-hero__ctas">
            <ButtonStyledLink
              variant="primary"
              href={loginPath}
              onClick={navigateWithin(loginPath)}
              labelText={_(msg`Get started`)}
            />
            <ButtonStyledLink
              variant="secondary"
              href={rentHistoryRequestUrl}
              target="_blank"
              rel="noreferrer"
              labelText={_(msg`I don’t have my rent history`)}
            />
          </div>
        </div>
      </section>

      <section className="landing-how">
        <div className="landing-how__inner">
          <h2 className="landing-how__heading">
            <Trans>How it works</Trans>
          </h2>
          <ol className="landing-how__list">
            <li className="landing-how__item">
              <StepNumberBadge stepNumber={1} />
              <div className="landing-how__item-text">
                <h3 className="landing-how__item-title">
                  <Trans>Scan your rent history with your phone</Trans>
                </h3>
                <p className="landing-how__item-desc">
                  <Trans>
                    Use our built-in scanner to photograph each page. No app
                    download needed.
                  </Trans>
                </p>
              </div>
            </li>
            <li className="landing-how__item">
              <StepNumberBadge stepNumber={2} />
              <div className="landing-how__item-text">
                <h3 className="landing-how__item-title">
                  <Trans>Answer a few questions</Trans>
                </h3>
                <p className="landing-how__item-desc">
                  <Trans>
                    We’ll ask you a few questions and run an analysis of your
                    rent history. If anything looks suspicious, we’ll ask some
                    simple follow-up questions to help understand if there are
                    any overcharges or violations.
                  </Trans>
                </p>
              </div>
            </li>
            <li className="landing-how__item">
              <StepNumberBadge stepNumber={3} />
              <div className="landing-how__item-text">
                <h3 className="landing-how__item-title">
                  <Trans>Get your report</Trans>
                </h3>
                <p className="landing-how__item-desc">
                  <Trans>
                    We generate a detailed report that explains what we found
                    and what it could mean, including what you can do next.
                  </Trans>
                </p>
              </div>
            </li>
          </ol>
          <CalloutBox
            className="landing-callout"
            title={<Trans>Don’t have your rent history?</Trans>}
            headingLevel={3}
            action={
              <ButtonStyledLink
                variant="primary"
                size="small"
                href={rentHistoryRequestUrl}
                target="_blank"
                rel="noreferrer"
                labelText={_(msg`Submit request`)}
              />
            }
          >
            <p>
              <Trans>
                Receive your rent history by mail. Take the first step to
                learning about your stabilized status and whether you’re paying
                too much rent.
              </Trans>
            </p>
          </CalloutBox>
        </div>
      </section>

      <section className="landing-about">
        <div className="landing-about__inner">
          <div className="landing-about__intro">
            <h2 className="landing-about__heading">
              <Trans>About this site</Trans>
            </h2>
            <p className="landing-about__text">
              <Trans>
                New York City has an estimated 800,000 rent-stabilized
                apartments. Landlords are required to self-report the rent
                amount of these apartments each year. Because of this,
                violations often go undetected. We built this tool to make the
                kind of analysis attorneys use accessible to anyone, for free.
              </Trans>
            </p>
            <Link
              className="landing-about__link"
              icon="internal"
              href={aboutPath}
              onClick={navigateWithin(aboutPath)}
            >
              <Trans>Learn more</Trans>
            </Link>
          </div>

          <div className="landing-about__org">
            <p className="landing-about__text">
              <Trans>
                This tool was created by JustFix, in collaboration with leading
                rent history experts.
              </Trans>
            </p>
            <CalloutBox
              className="landing-callout"
              title={<Trans>JustFix</Trans>}
              headingLevel={3}
              action={
                <Link
                  icon="external"
                  href={justfixUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Trans>Visit JustFix</Trans>
                </Link>
              }
            >
              <p>
                <Trans>
                  A nonprofit organization that builds online tools to help New
                  Yorkers achieve affordable, healthy, eviction-free housing.
                </Trans>
              </p>
            </CalloutBox>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
