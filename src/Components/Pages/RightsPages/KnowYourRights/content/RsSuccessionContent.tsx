import { Link } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

const SUCCESSION_FACT_SHEET_URL =
  "https://hcr.ny.gov/system/files/documents/2023/11/fact-sheet-30-11-2023.pdf";

export const RsSuccessionContent: React.FC = () => (
  <>
    <p>
      <Trans>
        If you are the immediate family member of a rent-stabilized tenant and
        have been living with them immediately prior to their moving or passing
        away, you might be entitled to take over the lease.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Learn more about succession rights</Trans>
    </h4>
    <p>
      <Link
        icon="external"
        href={SUCCESSION_FACT_SHEET_URL}
        target="_blank"
        rel="noreferrer"
      >
        <Trans>Link title</Trans>
      </Link>
    </p>
  </>
);
