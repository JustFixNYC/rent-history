import type { ReactNode } from "react";

export type FindingFormShellVariant = "active" | "completed";

export type FindingFormShellProps = {
  variant?: FindingFormShellVariant;
  badge?: ReactNode;
  title: ReactNode;
  body: ReactNode;
  cta?: ReactNode;
};

export const FindingFormShell = ({
  variant = "active",
  badge,
  title,
  body,
  cta,
}: FindingFormShellProps) => (
  <article
    className={`finding-form-shell finding-form-shell--${variant}`}
    data-testid="finding-form-shell"
    data-variant={variant}
  >
    <header className="finding-form-shell__header">
      {badge}
      <h2 className="finding-form-shell__title">{title}</h2>
    </header>
    <div className="finding-form-shell__body">{body}</div>
    {cta ? <div className="finding-form-shell__cta">{cta}</div> : null}
  </article>
);
