import { LinkStyledButton } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

import { ContentBox } from "../../ContentBox/ContentBox";
import type { ReferralPartner } from "./referralStorage";

import "./PartnerReferralCallout.scss";

export type PartnerReferralCalloutProps = {
  partner: ReferralPartner;
  onOptOut: () => void;
};

export const PartnerReferralCallout = ({
  partner,
  onOptOut,
}: PartnerReferralCalloutProps) => (
  <div
    className="partner-referral-callout"
    data-testid="partner-referral-callout"
  >
    <ContentBox
      className="partner-referral-callout__box"
      variant="info"
      action={
        <LinkStyledButton
          className="partner-referral-callout__opt-out"
          onClick={onOptOut}
        >
          <Trans>Don&apos;t share my information with this partner</Trans>
        </LinkStyledButton>
      }
    >
      <p className="partner-referral-callout__body">
        <Trans>
          Note: your information will also be shared with our partner
          organization {partner.name}.
        </Trans>
      </p>
    </ContentBox>
  </div>
);
