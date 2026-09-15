import { PartnerReferralCallout } from "./PartnerReferralCallout";
import type { ReferralPartner } from "./referralStorage";

import "./RequestForm.scss";

export type RequestFormProps = {
  referralPartner?: ReferralPartner | null;
  onReferralOptOut?: () => void;
};

/** Placeholder shell for Task 11 — form fields, GeoSearch, and submit wiring. */
export const RequestForm: React.FC<RequestFormProps> = ({
  referralPartner,
  onReferralOptOut,
}) => (
  <div className="request-form">
    {referralPartner && onReferralOptOut ? (
      <PartnerReferralCallout
        partner={referralPartner}
        onOptOut={onReferralOptOut}
      />
    ) : null}
    <div className="request-form__card" data-testid="request-form-stub" />
  </div>
);
