import { Icon, Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";

import {
  CPI_EFFECTIVE_DATE,
  INCREASE_PCT_STR,
} from "../../shared/gceRentIncreaseValues";
import {
  goodCauseLetterSenderUrl,
  goodCauseRentCalculatorUrl,
} from "../../shared/rightsUrls";

const REASONABLE_RENT_INCREASE_URL =
  "https://legalaidnyc.org/get-help/housing-problems/what-you-need-to-know-about-new-yorks-good-cause-eviction-law/#rent-increases";

export const GceRentIncreaseLimitsContent: React.FC = () => {
  const { _, i18n } = useLingui();
  const locale = i18n.locale;

  return (
    <>
      <p>
        <Trans>
          The state housing agency must publish each year’s “Reasonable Rent
          Increases” by August. The current maximum that your landlord can
          increase your rent by is {INCREASE_PCT_STR}%.
        </Trans>
      </p>

      <div className="rights-accordion-content__gce-callout">
        <p>
          <Trans>
            If you are offered a new lease after {_(CPI_EFFECTIVE_DATE)}, then
            your landlord can’t raise your apartment’s monthly rent higher than:
          </Trans>
        </p>
        <p className="rights-accordion-content__gce-callout-formula">
          <Trans>Your current monthly rent + {INCREASE_PCT_STR}%</Trans>
        </p>
        <p>
          <Link
            icon="external"
            href={goodCauseRentCalculatorUrl(locale)}
            target="_blank"
            rel="noreferrer"
          >
            <Trans>Calculate your maximum rent increase</Trans>
          </Link>
        </p>
        <div className="rights-accordion-content__gce-nested-info">
          <Icon icon="circleInfo" aria-hidden="true" />
          <div className="rights-accordion-content__gce-nested-info-body">
            <p>
              <Trans>
                <strong>If you’re covered by Good Cause</strong> and your
                landlord is planning to raise your rent beyond this amount, you
                can send a legally-vetted letter to your landlord to ask for a
                lower rent increase.
              </Trans>
            </p>
            <p>
              <Link
                icon="external"
                href={goodCauseLetterSenderUrl(locale)}
                target="_blank"
                rel="noreferrer"
              >
                <Trans>Check out the Letter Sender</Trans>
              </Link>
            </p>
          </div>
        </div>
      </div>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Note</Trans>
      </h4>
      <p>
        <Trans>
          Landlords can increase the rent more than the reasonable rent increase
          but they must explain why and must point to increases in their costs
          or substantial repairs they did to the apartment or building.
        </Trans>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Learn more about Reasonable Rent Increase</Trans>
      </h4>
      <p>
        <Link
          icon="external"
          href={REASONABLE_RENT_INCREASE_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Link title</Trans>
        </Link>
      </p>
    </>
  );
};
