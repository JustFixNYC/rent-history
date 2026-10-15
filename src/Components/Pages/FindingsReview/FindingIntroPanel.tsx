import type { ReactNode } from "react";

export type FindingIntroPanelProps = {
  title: ReactNode;
};

export const FindingIntroPanel = ({ title }: FindingIntroPanelProps) => (
  <section className="findings-review-intro" data-testid="finding-intro-panel">
    <h2 className="findings-review-intro__title">{title}</h2>
  </section>
);
