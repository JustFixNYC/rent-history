import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const NYCHA_OIH_URL = "https://www.nyc.gov/site/nycha/about/oih.page";

export const NychaRightToCounselContent: React.FC = () => (
  <>
    <p>
      <Trans>
        Legal representation can make a significant difference in ensuring a
        fair and just resolution to housing disputes, protecting residents from
        wrongful eviction or other adverse outcomes. If you do not have a lawyer
        and are facing a termination of tenancy at the Office of Impartial
        Hearings, you can ask for your case to be adjourned in order for you to
        seek counsel.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about NYCHA lease terminations</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={NYCHA_OIH_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Link title</Trans>
      </Link>
    </p>
  </>
);
