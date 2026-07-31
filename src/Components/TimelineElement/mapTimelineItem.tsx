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
  if (
    import.meta.env.DEV &&
    item.data.current_year != null &&
    item.data.current_year !== item.year
  ) {
    console.warn(
      `Timeline item type=${item.type}: data.current_year (${item.data.current_year}) does not match year (${item.year})`
    );
  }

  const composer = timelineComposers[item.type];
  const content = composer(item.data);

  return {
    variant: item.pills.includes("violation") ? "primary" : "secondary",
    year: item.year,
    endYear: item.end_year,
    pills: item.pills,
    title: content.title,
    description: content.description,
    whatThisMeans: content.whatThisMeans,
  };
}
