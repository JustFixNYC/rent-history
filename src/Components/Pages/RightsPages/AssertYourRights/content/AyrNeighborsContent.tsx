import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";

import {
  whoOwnsWhatBuildingAlertsUrl,
  whoOwnsWhatHomeUrl,
} from "../../shared/rightsUrls";

export const AyrNeighborsContent: React.FC = () => {
  const { i18n } = useLingui();
  const locale = i18n.locale;

  return (
    <>
      <p>
        <Trans>
          You may not be the only person in your building dealing with the same
          problems. Talking with your neighbors can help you find out if similar
          things are happening to them too.
        </Trans>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>What you might learn</Trans>
      </h4>
      <p>
        <Trans>
          You might learn that your neighbors also received large rent increases
          around the same time, had their rent stabilized status changed, are
          living with the same unsafe conditions, or are also being ignored or
          harassed by your landlord.
        </Trans>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>What you can do</Trans>
      </h4>
      <p>
        <Trans>
          If your neighbors are facing similar problems, you can work together
          to document what is happening, raise concerns with your landlord,
          contact government agencies, or take action as a group. When tenants
          come together, you have power.
        </Trans>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Your legal right</Trans>
      </h4>
      <p>
        <Trans>
          You have a legal right to talk with your neighbors and organize with
          other tenants. It is illegal for your landlord to interfere with
          tenant organizing or retaliate against you for taking part.
        </Trans>
      </p>
      <p>
        <Link
          icon="external"
          href="https://www.nyc.gov/assets/tenantprotection/downloads/pdf/MOPT-Right-to-Organize-Letter.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Learn about your right to organize</Trans>
        </Link>
      </p>
      <p>
        <Link
          icon="external"
          href="https://www.metcouncilonhousing.org/help-answers/forming-a-tenants-association/"
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Learn about how to form a tenants’ association</Trans>
        </Link>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>More ways to learn about your building</Trans>
      </h4>
      <p>
        <Trans>
          You can also look up your building’s history to see past violations,
          eviction cases, landlord information, and changes in the number of
          rent-stabilized apartments.
        </Trans>
      </p>
      <p>
        <Trans>
          You can also sign up for updates about new issues in your building.{" "}
          <Link
            href={whoOwnsWhatBuildingAlertsUrl(locale)}
            target="_blank"
            rel="noreferrer"
          >
            Get building alerts
          </Link>
        </Trans>
      </p>
      <p>
        <Link
          icon="external"
          href={whoOwnsWhatHomeUrl(locale)}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Research your building and landlord</Trans>
        </Link>
      </p>
      <p>
        <Link
          icon="external"
          href={whoOwnsWhatHomeUrl(locale)}
          target="_blank"
          rel="noreferrer"
        >
          <Trans>Get updates about problems in your building</Trans>
        </Link>
      </p>
    </>
  );
};
