import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

export const AyrRentReductionCheckContent: React.FC = () => (
  <>
    <p>
      <Trans>
        A previous tenant may have gotten their rent reduced because [plain
        language for “reduced services”]. That rent reduction may still be
        active, and if that’s true...
      </Trans>
    </p>
    <p>
      <Trans>
        If you’re concerned about your rent, finding out whether there is an
        existing order can give you important context before you decide what to
        do.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>What is a rent reduction order?</Trans>
    </h4>
    <p>
      <Trans>
        A rent reduction order is issued by the Division of Housing and
        Community Renewal (DHCR) when an owner has failed to provide required or
        essential services. A rent reduction order can require the landlord to
        reduce the legal rent because required services were not being provided.
        A rent reduction order remains in effect until DHCR issues an order
        restoring the rent.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>If there is an active rent reduction order</Trans>
    </h4>
    <p>
      <Trans>
        If there is an active rent reduction order for your apartment and your
        landlord is charging you more than the reduced rent, that can be
        evidence of an overcharge. A rent reduction order can also tell you what
        problem led to the rent reduction and when the reduced rent took effect.
      </Trans>
    </p>
    <p>
      <Link
        icon="external"
        href="https://hcr.ny.gov/records-access"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Request records using the REC-1 form</Trans>
      </Link>
    </p>
  </>
);
