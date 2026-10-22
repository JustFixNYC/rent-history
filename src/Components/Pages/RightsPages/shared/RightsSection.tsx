import classNames from "classnames";
import type { ReactNode } from "react";

import "./RightsSection.scss";

export type RightsSectionProps = {
  title: ReactNode;
  intro?: ReactNode;
  infoCallout?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Optional stable id on the section wrapper. */
  sectionId?: string;
};

export const RightsSection = ({
  title,
  intro,
  infoCallout,
  children,
  className,
  sectionId,
}: RightsSectionProps) => (
  <section
    className={classNames("rights-section", className)}
    {...(sectionId ? { id: sectionId } : {})}
  >
    <div className="rights-section__inner">
      <h2 className="rights-section__title">{title}</h2>
      {intro ? <div className="rights-section__intro">{intro}</div> : null}
      {infoCallout ? (
        <div className="rights-section__info-callout">{infoCallout}</div>
      ) : null}
      {children ? (
        <div className="rights-section__content">{children}</div>
      ) : null}
    </div>
  </section>
);
