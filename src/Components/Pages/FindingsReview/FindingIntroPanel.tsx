import type { ReactNode } from "react";

export type FindingIntroPanelProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  description: ReactNode;
};

export const FindingIntroPanel = ({
  eyebrow,
  title,
  description,
}: FindingIntroPanelProps) => (
  <section className="findings-review-intro" data-testid="finding-intro-panel">
    <p className="findings-review-intro__eyebrow">{eyebrow}</p>
    <h1 className="findings-review-intro__title">{title}</h1>
    <p className="findings-review-intro__description">{description}</p>
  </section>
);
