import { Trans } from "@lingui/react/macro";

import { TempExemptionTitle } from "../titles/titles";
import type { TimelineComposer } from "./types";

export const composeTempExemption: TimelineComposer = () => {
  return {
    title: <TempExemptionTitle />,
    description: (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.temp_exemption">
          The apartment was temporarily exempt from rent stabilization during
          this period. A temporary exemption means that the apartment was not
          registered as rent stabilized during this period, but does not mean
          that it was permanently removed from rent stabilization.
        </Trans>
      </div>
    ),
  };
};
