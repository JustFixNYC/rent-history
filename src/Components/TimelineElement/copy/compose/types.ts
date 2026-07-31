import type { ReactNode } from "react";

import type { TimelineElementData } from "../../types";

export type TimelineContent = {
  title: ReactNode;
  description: ReactNode;
  whatThisMeans?: ReactNode;
};

export type TimelineComposer = (data: TimelineElementData) => TimelineContent;
