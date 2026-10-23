import { Icon } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

export const AyrAskLandlordContent: React.FC = () => (
  <>
    <div className="rights-accordion-content__info-panel">
      <Icon icon="circleInfo" aria-hidden="true" />
      <p>
        <Trans>
          You don’t have to contact your landlord directly if you don’t feel
          comfortable doing so. If you’re concerned about retaliation,
          harassment, or another potential risk, consider talking with a tenant
          organization or lawyer first.
        </Trans>
      </p>
    </div>

    <p>
      <Trans>
        Your landlord may be able to explain how your rent was calculated, why
        it changed, or provide documents related to your apartment. Asking
        questions can sometimes resolve a misunderstanding or help you
        understand what happened before you decide whether to take further
        action.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>If the conversation becomes a negotiation</Trans>
    </h4>
    <p>
      <Trans>
        Your conversation may turn into a negotiation if you and your landlord
        disagree about what should happen next. For example, you might ask the
        landlord to correct your rent, refund money you believe you were
        overcharged, or provide documentation supporting the amount you’re being
        charged.
      </Trans>
    </p>
    <p>
      <Trans>
        <strong>You don’t have to agree to a proposal on the spot.</strong> If
        your landlord offers to resolve the issue, take time to understand what
        you’re agreeing to and consider getting advice before signing anything
        or giving up a claim.
      </Trans>
    </p>
    <p>
      <Trans>
        <strong>
          You don’t necessarily have to prove everything yourself.
        </strong>{" "}
        Depending on the issue, the landlord may be required to provide records
        or explain how a rent was calculated. Don’t assume that the absence of
        records you personally have means there is no way to challenge the rent.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>If the problem happened before your landlord took ownership</Trans>
    </h4>
    <p>
      <Trans>
        A change in ownership doesn’t necessarily erase problems that occurred
        before the current owner took over. In many circumstances, a current
        owner can be responsible for rent-related obligations and overcharges
        associated with a previous owner. Current owners are generally expected
        to have done their due diligence when purchasing a property.
      </Trans>
    </p>
    <p>
      <Trans>
        If your concern involves something that happened before your landlord
        became the owner, don’t assume that you have no recourse simply because
        the current owner wasn’t involved at the time.
      </Trans>
    </p>

    <h4 className="rights-accordion-content__subhead">
      <Trans>Keep in mind</Trans>
    </h4>
    <p>
      <Trans>
        Consider communicating in writing and keeping copies of letters, emails,
        messages, leases, notices, and other documents. If you speak with your
        landlord by phone or in person, consider following up in writing with a
        summary of what was discussed.
      </Trans>
    </p>
  </>
);
