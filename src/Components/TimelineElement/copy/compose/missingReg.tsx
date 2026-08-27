import { Trans } from "@lingui/react/macro";

import type { TimelineElementData } from "../../types";
import { MissingRegTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeMissingReg(
  _data: TimelineElementData,
  _context: TimelineComposerContext
): TimelineContent {
  return {
    title: <MissingRegTitle />,
    description: (
      <div className="timeline-element__copy-paragraph">
        <Trans id="timeline.copy.missing_reg">
          The apartment does not have a rent registration for this period. A
          missing registration does not necessarily mean that anything was done
          improperly. Understanding why an apartment was not registered during a
          particular period can help clarify its rent stabilization history.
        </Trans>
      </div>
    ),
  };
}
