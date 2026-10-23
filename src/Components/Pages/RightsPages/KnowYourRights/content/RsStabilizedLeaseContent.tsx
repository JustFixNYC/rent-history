import { Link } from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { rentHistoryRequestUrl } from "../../shared/rightsUrls";

const EXAMPLE_LEASE_URL =
  "https://hcr.ny.gov/system/files/documents/2023/06/rtp-8-06-2023-sample.pdf";
const LEASE_RIDER_FACT_SHEET_URL =
  "https://hcr.ny.gov/system/files/documents/2020/10/fact-sheet-02-10-2020_0.pdf";

export const RsStabilizedLeaseContent: React.FC = () => {
  const { i18n } = useLingui();

  return (
    <>
      <p>
        <Trans>
          If your apartment is rent stabilized, your landlord must give you a
          rent-stabilized lease. Your lease should tell you that your apartment
          is rent stabilized and provide information about your rent and the
          terms of your tenancy.
        </Trans>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Your landlord should provide you with</Trans>
      </h4>
      <ul>
        <li>
          <Trans>
            <strong>A rent-stabilized lease:</strong> You should receive a
            written lease that reflects your apartment’s rent-stabilized status.{" "}
            <Link
              href={EXAMPLE_LEASE_URL}
              target="_blank"
              rel="noreferrer"
              icon="external"
            >
              View example lease
            </Link>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>A Rent Stabilization lease rider:</strong> The rider
            explains your rights and responsibilities as a rent-stabilized
            tenant and provides information about your rent, including the
            previous rent and reasons for increases.{" "}
            <Link
              href={LEASE_RIDER_FACT_SHEET_URL}
              target="_blank"
              rel="noreferrer"
              icon="external"
            >
              link
            </Link>
          </Trans>
        </li>
        <li>
          <Trans>
            <strong>A copy of your signed lease:</strong> Your landlord must
            provide you with a fully executed copy of your lease within 30 days
            of signing.
          </Trans>
        </li>
      </ul>

      <h4 className="rights-accordion-content__subhead">
        <Trans>What if my landlord didn’t give me a lease or rider?</Trans>
      </h4>
      <p>
        <Trans>
          If you don’t have a lease, or your lease doesn’t say that your
          apartment is rent stabilized, you may still have the rights and
          protections that come with rent stabilization.
        </Trans>
      </p>

      <h4 className="rights-accordion-content__subhead">
        <Trans>Not sure if your apartment is rent stabilized?</Trans>
      </h4>
      <p>
        <Link href={rentHistoryRequestUrl(i18n.locale)} icon="external">
          <Trans>Request your rent history</Trans>
        </Link>
      </p>
    </>
  );
};
