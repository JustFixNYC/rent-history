import { Icon, Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

import { LocaleLink } from "../../../../RouterLinks";

export const AyrDhcrComplaintContent: React.FC = () => (
  <>
    <div className="rights-accordion-content__info-panel">
      <Icon icon="circleInfo" aria-hidden="true" />
      <p>
        <Trans>
          Filing a complaint is a formal step. It may take more than a year to
          hear back, and DHCR may request additional information or
          documentation. Consider getting advice from a tenant organization or
          lawyer if you’re unsure whether filing is right for you.
        </Trans>
      </p>
    </div>

    <p>
      <Trans>
        If you believe you’ve been charged more than the legal rent for your
        apartment, you may be able to file an overcharge complaint with DHCR.
        DHCR can review the evidence, determine whether an overcharge occurred,
        and order an appropriate remedy when it finds a violation.
      </Trans>
    </p>
    <p>
      <Trans>
        You can file on your own or, in some circumstances, together with other
        tenants who believe they have experienced similar overcharges. If
        several tenants in your building are seeing the same pattern, you may
        want to consult a tenant organization about whether a group complaint or
        other collective action makes sense.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>What happens when you file?</Trans>
    </h4>
    <p>
      <Trans>
        A DHCR complaint is not anonymous. DHCR serves the complaint on the
        owner and gives the owner an opportunity to respond.
      </Trans>
    </p>
    <p>
      <Trans>
        DHCR may ask the landlord to provide information and records related to
        your rent. You may also be asked to provide additional information or
        respond to the landlord’s submission.
      </Trans>
    </p>
    <p>
      <Trans>
        Because your landlord will know that you filed a complaint, filing can
        expose you to the possibility of landlord retaliation. New York law
        provides protections against certain forms of retaliation, but the
        possibility of retaliation is something you may want to consider before
        filing. If you’re concerned about retaliation, consider talking with a
        tenant organization or lawyer first.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>What to gather</Trans>
    </h4>
    <ul>
      <li>
        <Trans>Your DHCR rent history</Trans>
      </li>
      <li>
        <Trans>Current and previous leases</Trans>
      </li>
      <li>
        <Trans>Rent increase notices</Trans>
      </li>
      <li>
        <Trans>Rent payment records</Trans>
      </li>
      <li>
        <Trans>Correspondence with your landlord</Trans>
      </li>
      <li>
        <Trans>DHCR orders or other documents related to your apartment</Trans>
      </li>
      <li>
        <Trans>Your Analyzer report, if you’ve used it</Trans>
      </li>
    </ul>

    <h4 className="rights-accordion-content__subhead">
      <Trans>File an overcharge complaint with DHCR</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href="https://hcr.ny.gov/tenants-self-service-applications"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>File online with NYS Rent Connect</Trans>
      </Link>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Not sure if you’ve been overcharged?</Trans>
    </h4>
    <p>
      <LocaleLink to="analyze/login">
        <Trans>Analyze your rent history</Trans>
      </LocaleLink>
    </p>
  </>
);
