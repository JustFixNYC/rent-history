import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const MET_COUNCIL_TENANT_ASSOCIATION_URL =
  "https://www.metcouncilonhousing.org/help-answers/forming-a-tenants-association/";

export const NycOrganizeContent: React.FC = () => (
  <>
    <p>
      <Trans>
        Has your landlord raised your rent? Is your landlord refusing to do basic
        repairs? Are you worried about getting evicted or non-renewed?
      </Trans>
    </p>
    <p>
      <Trans>
        You’re not alone. Too many landlords care more about getting rich off
        our rent money than providing us with decent homes.
      </Trans>
    </p>
    <p>
      <Trans>
        When tenants come together, we have power. Tenants across our state are
        forming tenant unions to fight back. If you're interested in
        organizing a tenant union with your neighbors, fill out this form to get
        support from a tenant group near you.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn how tenant associations can help</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={MET_COUNCIL_TENANT_ASSOCIATION_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>
          Met Council on Housing’s Guide to forming a tenant association
        </Trans>
      </Link>
    </p>
  </>
);
