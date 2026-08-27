import type { TimelineElementData } from "../../types";
import { NoFindingTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeNoFinding(
  _data: TimelineElementData,
  _context: TimelineComposerContext
): TimelineContent {
  return {
    title: <NoFindingTitle />,
  };
}
