import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

export const AyrTenantOrgContent: React.FC = () => (
  <>
    <p>
      <Trans>
        Tenant organizations can help you understand your situation, learn about
        your rights, and decide what options may be available to you. Some
        organizations provide individual advice, while others help tenants
        organize around issues affecting their building or neighborhood.
      </Trans>
    </p>
    <p>
      <Trans>
        You can reach out even if you’re not sure whether your landlord has done
        anything wrong.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Before you reach out</Trans>
    </h4>
    <p>
      <Trans>
        It may help to have your lease, rent history, payment records, and any
        other notices or messages from your landlord available. You don’t need
        to have everything figured out before you ask for help.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>What they may be able to help with</Trans>
    </h4>
    <ul>
      <li>
        <Trans>Identifying possible rent violations</Trans>
      </li>
      <li>
        <Trans>Understanding the terms of your lease</Trans>
      </li>
      <li>
        <Trans>Understanding your options</Trans>
      </li>
      <li>
        <Trans>Connecting you with legal assistance or other resources</Trans>
      </li>
    </ul>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Where to start</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href="https://housingcourtanswers.org/contact-us/"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Call the Housing Court Answers hotline</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href="https://www.metcouncilonhousing.org/copy-of-campaigns-for-fun"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Call Met Council on Housing Hotline</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href="https://www.nyc.gov/site/311/get-help/tenant-resources.page"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Call the 311 Tenant Helpline</Trans>
      </Link>
    </p>
  </>
);
