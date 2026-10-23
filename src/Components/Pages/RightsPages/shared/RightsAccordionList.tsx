import { Accordion, AccordionGroup } from "@justfixnyc/component-library";
import classNames from "classnames";

import type { RightsAccordionConfig } from "./rightsSectionTypes";
import "./RightsAccordionList.scss";

export type RightsAccordionListProps = {
  items: RightsAccordionConfig[];
  className?: string;
};

export const RightsAccordionList = ({
  items,
  className,
}: RightsAccordionListProps) => (
  <AccordionGroup className={classNames("rights-accordion-list", className)}>
    {items.map((item) => (
      <Accordion
        key={item.id}
        id={item.id}
        deepLink
        stepBadge={item.stepBadge}
        triggerClassName={classNames(
          "rights-accordion-list__trigger",
          item.triggerClassName
        )}
        summary={
          <span className="rights-accordion-list__summary">{item.title}</span>
        }
      >
        <div
          className={classNames(
            "rights-accordion-content",
            item.contentClassName
          )}
        >
          {item.content}
        </div>
      </Accordion>
    ))}
  </AccordionGroup>
);
