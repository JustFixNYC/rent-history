import type { TimelineElementData } from "../../types";
import { SubstantialRehabExplainedParagraph } from "../paragraphs/SubstantialRehabExplainedParagraph";
import { DestabSubRehabPosthstpaTitle } from "../titles/titles";
import type { TimelineComposerContext, TimelineContent } from "./types";

export function composeDestabSubRehabPosthstpa(
  _data: TimelineElementData,
  _context: TimelineComposerContext
): TimelineContent {
  return {
    title: <DestabSubRehabPosthstpaTitle />,
    description: <SubstantialRehabExplainedParagraph />,
  };
}
