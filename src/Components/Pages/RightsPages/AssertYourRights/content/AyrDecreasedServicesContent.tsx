import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

import { LocaleLink } from "../../../../RouterLinks";

export const AyrDecreasedServicesContent: React.FC = () => (
  <>
    <p>
      <Trans>
        Rent-regulated tenants may be able to ask DHCR to reduce their rent when
        their landlord fails to provide required or essential services. This can
        include problems with an individual apartment or building-wide services,
        such as heat, hot water, elevators, or common areas.
      </Trans>
    </p>
    <p>
      <Trans>
        You can file a complaint about conditions in your own apartment. If a
        problem affects the entire building, tenants may also be able to file
        together as part of a building-wide service complaint.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Before you file</Trans>
    </h4>
    <p>
      <Trans>
        Document the problem and any attempts you’ve made to get your landlord
        to correct it. Photos, messages, letters, and other records may be
        useful.
      </Trans>
    </p>
    <p>
      <Trans>
        DHCR recommends, but does not require, that tenants first inform the
        owner in writing when services aren’t being maintained.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>What happens after you file?</Trans>
    </h4>
    <p>
      <Trans>
        If DHCR determines that required services have not been maintained, it
        may issue an order reducing the rent and directing the owner to restore
        the services. For rent-stabilized apartments, the reduction generally
        remains in effect until DHCR issues a rent restoration order.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>What you can do</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href="https://hcr.ny.gov/tenants-self-service-applications"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>File a decreased services complaint</Trans>
      </Link>
    </p>
    <p>
      <LocaleLink to="assert-your-rights#ayr-rent-reduction-check">
        <Trans>Learn more about rent reductions</Trans>
      </LocaleLink>
    </p>
  </>
);
