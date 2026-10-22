import type { ReactNode } from "react";

/** One accordion row in a section — maps to JFCL Accordion + deepLink. */
export type RightsAccordionConfig = {
  id: string;
  title: ReactNode;
  content: ReactNode;
  stepBadge?: number | string;
  triggerClassName?: string;
  contentClassName?: string;
};

export type RightsCtaCardVariant =
  | "analyze"
  | "rentHistoryRequest"
  | "goodCause";

export type RightsCtaCardConfig = {
  variant: RightsCtaCardVariant;
  title: ReactNode;
  body: ReactNode;
  buttonLabel?: string;
  className?: string;
};

export type RightsSectionConfig = {
  /** Stable id for in-page anchors / analytics (optional). */
  sectionId?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Assert Phase 2 purple info callout (custom SCSS in RightsSection). */
  infoCallout?: ReactNode;
  accordions?: RightsAccordionConfig[];
  ctas?: RightsCtaCardConfig[];
};
