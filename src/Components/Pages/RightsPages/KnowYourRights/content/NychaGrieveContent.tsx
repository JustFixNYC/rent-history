import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const NYCHA_GRIEVANCE_PROCEDURES_URL =
  "https://www.nyc.gov/site/nycha/residents/acop/chapter-12.page";

export const NychaGrieveContent: React.FC = () => (
  <>
    <p>
      <Trans>
        In instances where residents disagree with management decisions or
        believe their rights have been violated, they have the right to grieve
        these issues through a formal process. Residents can file grievances
        online through the resident portal or on paper by visiting the
        management office.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about the grievance procedures</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={NYCHA_GRIEVANCE_PROCEDURES_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Link title</Trans>
      </Link>
    </p>
  </>
);
