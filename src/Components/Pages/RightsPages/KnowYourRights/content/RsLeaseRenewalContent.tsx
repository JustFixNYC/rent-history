import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const LEASE_RENEWAL_FACT_SHEET_URL =
  "https://hcr.ny.gov/system/files/documents/2023/04/fact-sheet-04-04-2023.pdf";

export const RsLeaseRenewalContent: React.FC = () => (
  <>
    <p>
      <Trans>
        If you are rent-stabilized your landlord cannot simply decide they don’t
        want you as a tenant anymore, they are limited to certain reasons for
        evicting you.
      </Trans>
    </p>
    <p>
      <Trans>
        Your landlord is required to provide a lease upon renewal. However, if
        they don’t, you are allowed to remain in your apartment and continue
        your tenancy under the terms of the most recently signed lease.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about lease renewal rights</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={LEASE_RENEWAL_FACT_SHEET_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Link title</Trans>
      </Link>
    </p>
  </>
);
