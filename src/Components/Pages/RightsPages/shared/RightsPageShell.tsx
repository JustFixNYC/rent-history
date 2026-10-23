import type { ReactNode } from "react";

import "./RightsPageShell.scss";

export type RightsPageShellProps = {
  heroTitle: ReactNode;
  heroIntro: ReactNode;
  children: ReactNode;
};

export const RightsPageShell = ({
  heroTitle,
  heroIntro,
  children,
}: RightsPageShellProps) => (
  <div className="rights-page">
    <header className="rights-page__hero">
      <div className="rights-page__hero-inner">
        <h1 className="rights-page__hero-title">{heroTitle}</h1>
        <div className="rights-page__hero-intro">{heroIntro}</div>
      </div>
    </header>
    <div className="rights-page__body">{children}</div>
  </div>
);
