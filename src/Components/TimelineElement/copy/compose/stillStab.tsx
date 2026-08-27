import { Trans } from "@lingui/react/macro";

import type { TimelineElementData } from "../../types";
import { StillStabTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeStillStab(
  _data: TimelineElementData,
  _context: TimelineComposerContext
): TimelineContent {
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
}
