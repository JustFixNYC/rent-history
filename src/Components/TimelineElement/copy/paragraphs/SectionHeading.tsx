import type { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
};

export const SectionHeading = ({ children }: SectionHeadingProps) => (
  <div className="timeline-element__section-heading">{children}</div>
);
