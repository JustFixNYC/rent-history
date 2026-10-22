import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";

import { letterOfComplaintUrl } from "../../shared/rightsUrls";

const WARRANTY_OF_HABITABILITY_URL =
  "https://www.nycourts.gov/courts/nyc/housing/pdf/warranty_of_habitability.pdf";
const MET_COUNCIL_REPAIRS_URL =
  "https://www.metcouncilonhousing.org/help-answers/getting-repairs/";
const HCA_REPAIRS_URL =
  "https://housingcourtanswers.org/answers/for-tenants/repairs/";

export const NycLivableHomeContent: React.FC = () => {
  const { i18n } = useLingui();
  const locale = i18n.locale;

  return (
    <>
      <p>
        <Trans>
          Tenants have the right to live in a safe, sanitary, and
          well-maintained apartment, including public areas of the building.
          This right is implied in every residential lease, and any lease
          provision that waives it is void. If your landlord is not providing
          these conditions in your apartment or building, there are actions you
          can take to exercise your rights.
        </Trans>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Learn about the Warranty of Habitability</Trans>
      </h4>
      <p>
        <Link
          icon="external"
          href={WARRANTY_OF_HABITABILITY_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>NY Courts Warranty of Habitability fact sheet</Trans>
        </Link>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Learn more about requesting repairs</Trans>
      </h4>
      <p>
        <Link
          icon="external"
          href={MET_COUNCIL_REPAIRS_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Met Council on Housing guide to getting repairs</Trans>
        </Link>
      </p>
      <p>
        <Link
          icon="external"
          href={HCA_REPAIRS_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Housing Court Answers repairs resources</Trans>
        </Link>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>
          Send a free, legally vetted letter to notify your landlord of repair
          issues
        </Trans>
      </h4>
      <p>
        <Link
          icon="external"
          href={letterOfComplaintUrl(locale)}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>JustFix’s Letter of Complaint</Trans>
        </Link>
      </p>
    </>
  );
};
