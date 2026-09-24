import type { TimelineElementProps } from "./TimelineElement";
import { timelineComposers } from "./copy/compose/registry";
import type { TimelineItem } from "./types";

export type MappedTimelineElementProps = Omit<
  TimelineElementProps,
  "defaultOpen" | "className"
>;

export function mapTimelineItemToProps(
  item: TimelineItem
): MappedTimelineElementProps {
  const composer = timelineComposers[item.type];
  const content = composer(item.data, {
    findingYear: item.year,
    endYear: item.end_year,
  });

  return {
    variant: item.pills.includes("violation") ? "primary" : "secondary",
    year: item.year,
    endYear: item.end_year,
    pills: item.pills,
    title: content.title,
    description: content.description,
    footnote: content.footnote,
    whatThisMeans: content.whatThisMeans,
  };
}
