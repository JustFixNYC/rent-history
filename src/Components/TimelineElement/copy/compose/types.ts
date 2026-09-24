import type { ReactNode } from "react";

import type { TimelineElementData } from "../../types";

export type TimelineComposerContext = {
  findingYear: number;
  endYear?: number;
};

export type TimelineContent = {
  title: ReactNode;
  description?: ReactNode;
  footnote?: ReactNode;
  whatThisMeans?: ReactNode;
};

export type TimelineComposer = (
  data: TimelineElementData,
  context: TimelineComposerContext
) => TimelineContent;
