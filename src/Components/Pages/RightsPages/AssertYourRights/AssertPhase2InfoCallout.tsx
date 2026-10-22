import { Icon } from "@justfixnyc/component-library";
import { Trans } from "@lingui/react/macro";

/** Phase 2 section info box (6785-17349). */
export const AssertPhase2InfoCallout: React.FC = () => (
  <>
    <Icon icon="circleInfo" aria-hidden="true" />
    <p>
      <Trans>
        Consider getting advice from an attorney or tenant organization to
        understand the potential risks before taking formal action.
      </Trans>
    </p>
  </>
);
