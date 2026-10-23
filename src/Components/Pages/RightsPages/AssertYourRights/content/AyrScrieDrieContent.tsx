import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

export const AyrScrieDrieContent: React.FC = () => (
  <>
    <p>
      <Trans>
        <strong>SCRIE</strong> and <strong>DRIE</strong> are NYC Rent Freeze
        programs that can protect eligible tenants from future rent increases.
      </Trans>
    </p>
    <p>
      <Trans>
        <strong>SCRIE</strong> is for eligible older adults, while{" "}
        <strong>DRIE</strong> is for eligible people with disabilities. If you
        qualify, the program can freeze your rent and protect you from future
        increases.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>You may qualify if…</Trans>
    </h4>
    <p>
      <Trans>
        For SCRIE, NYC currently lists requirements including being at least 62,
        having combined household income of $50,000 or less, spending more than
        one-third of household income on rent, and living in an eligible
        apartment.
      </Trans>
    </p>
    <p>
      <Trans>
        You can use NYC’s eligibility tool to find out whether you may qualify.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href="https://www.nyc.gov/site/rentfreeze/qualifications/qualifications.page"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Check your eligibility</Trans>
      </Link>
    </p>
    <p>
      <Link
        icon="external"
        href="https://www.nyc.gov/site/rentfreeze/apply/apply-renew.page"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Apply for SCRIE or DRIE</Trans>
      </Link>
    </p>
  </>
);
