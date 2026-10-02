import { Trans } from "@lingui/react/macro";

import { StillStabTitle } from "../titles/titles";
import type { TimelineComposer } from "./types";

export const composeStillStab: TimelineComposer = () => {
  return {
    title: <StillStabTitle />,
    description: (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.still_stab">
          Your rent history shows that your apartment was registered as rent
          stabilized in the most recent year.
        </Trans>
      </div>
    ),
  };
};
