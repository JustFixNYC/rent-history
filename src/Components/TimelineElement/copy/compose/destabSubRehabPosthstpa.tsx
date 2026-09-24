import { SubstantialRehabExplainedParagraph } from "../paragraphs/SubstantialRehabExplainedParagraph";
import { DestabSubRehabPosthstpaTitle } from "../titles/titles";
import type { TimelineComposer } from "./types";

export const composeDestabSubRehabPosthstpa: TimelineComposer = () => {
  return {
    title: <DestabSubRehabPosthstpaTitle />,
    description: <SubstantialRehabExplainedParagraph />,
  };
};
