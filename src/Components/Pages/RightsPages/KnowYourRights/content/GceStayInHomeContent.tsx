import { Icon, Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";

import { goodCauseLetterSenderUrl } from "../../shared/rightsUrls";

const GOOD_CAUSE_EVICTION_REASONS_URL =
  "https://www.nyc.gov/site/hpd/services-and-information/good-cause-eviction.page#:~:text=What%20are%20the%20%E2%80%9Cgood%20cause%E2%80%9D%20reasons%20for%20eviction%2C%20nonrenewal%20of%20lease%2C%20or%20termination%20of%20tenancy%3F";

export const GceStayInHomeContent: React.FC = () => {
  const { i18n } = useLingui();
  const locale = i18n.locale;

  return (
    <>
      <p>
        <Trans>
          Your landlord will need to provide a good cause reason for ending a
          tenancy. Even if your lease expires, your landlord cannot evict you,
          as long as you abide by the terms of your expired lease.
        </Trans>
      </p>
      <p>
        <Trans>
          Under the Good Cause Eviction law, landlords are allowed to evict
          tenants for the following “good cause” reasons:
        </Trans>
      </p>
      <ul>
        <li>
          <Trans>
            <strong>Non payment of rent</strong>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>Lease violations</strong>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>Nuisance activity</strong>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>Illegal Activity</strong>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>Landlord personal use/removal from market</strong>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>Demolition</strong>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>
              Failure to sign lease renewal or provide access to apartment
            </strong>
          </Trans>
        </li>
      </ul>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Learn more about Good Cause reasons for eviction</Trans>
      </h4>
      <p>
        <Link
          icon="external"
          href={GOOD_CAUSE_EVICTION_REASONS_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Link title</Trans>
        </Link>
      </p>

      <div className="rights-accordion-content__info-panel rights-accordion-content__info-panel--bordered">
        <Icon icon="circleInfo" aria-hidden="true" />
        <div>
          <p>
            <Trans>
              <strong>If you’re covered by Good Cause</strong> and your landlord
              is planning to raise your rent beyond this amount, you can send a
              legally-vetted letter to your landlord to ask for a lower rent
              increase.
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
    </>
  );
};
