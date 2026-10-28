import { Trans } from "@lingui/react/macro";

import { DocumentLink } from "../../DocumentLink/DocumentLink";
import { TimelineElement } from "../../TimelineElement/TimelineElement";
import { mapTimelineItemToProps } from "../../TimelineElement/mapTimelineItem";
import { mockTimelineElements } from "../../TimelineElement/mockData";
import type { TimelineItem } from "../../TimelineElement/types";

export type ReportTimelineSectionProps = {
  items?: TimelineItem[];
};

export const ReportTimelineSection = ({
  items = mockTimelineElements,
}: ReportTimelineSectionProps) => {
  return (
    <section
      className="report-page__band report-page__band--timeline"
      aria-labelledby="report-timeline-heading"
    >
      <div className="report-page__timeline-header">
        <h2
          id="report-timeline-heading"
          className="report-page__section-heading"
        >
          <Trans>Timeline of events</Trans>
        </h2>
        <DocumentLink
          className="report-page__timeline-document-link"
          label={<Trans>View rent history</Trans>}
        />
      </div>
      <div className="report-page__timeline-body">
        <ol className="timeline">
          {items.map((item, index) => (
            <li key={`${item.type}-${item.year}-${index}`}>
              <TimelineElement {...mapTimelineItemToProps(item)} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
