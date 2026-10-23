import { Icon, Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

export const AyrSupremeCourtContent: React.FC = () => (
  <>
    <div className="rights-accordion-content__info-panel">
      <Icon icon="circleInfo" aria-hidden="true" />
      <p>
        <Trans>
          Consider speaking with a lawyer or tenant organization about your
          specific situation. Make sure you understand the potential risks and
          consequences.
        </Trans>
      </p>
    </div>

    <p>
      <Trans>
        In some circumstances, a tenant may be able to bring a case in Supreme
        Court to enforce their rights or seek money they believe they are owed.
        Whether this is an appropriate option depends on the specific facts of
        your situation.
      </Trans>
    </p>
    <p>
      <Trans>
        Court cases can be complex and can involve legal deadlines, filing
        requirements, evidence, and other risks. Consider talking with a lawyer
        or tenant organization before deciding whether to bring a case.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>You may want legal advice about</Trans>
    </h4>
    <ul>
      <li>
        <Trans>Whether you have a claim</Trans>
      </li>
      <li>
        <Trans>Which court or legal process is appropriate</Trans>
      </li>
      <li>
        <Trans>What you may be able to recover</Trans>
      </li>
      <li>
        <Trans>Whether there are deadlines that apply</Trans>
      </li>
      <li>
        <Trans>What evidence you should preserve</Trans>
      </li>
      <li>
        <Trans>Whether there are risks to bringing the case</Trans>
      </li>
    </ul>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Gather your records</Trans>
    </h4>
    <p>
      <Trans>
        Keep your rent history, leases, rent notices, payment records,
        communications with your landlord, and any DHCR orders or other
        documents related to your apartment.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Find legal help</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href="https://www.lawhelpny.org/"
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Find free and low-cost legal help in New York</Trans>
      </Link>
    </p>
  </>
);
