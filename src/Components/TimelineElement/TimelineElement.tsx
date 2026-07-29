import { useId, useState, type ReactNode } from "react";
import classNames from "classnames";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import {
  Button,
  Icon,
  LinkStyledButton,
  Pill,
} from "@justfixnyc/component-library";

import "./TimelineElement.scss";

export type TimelinePillType =
  | "violation"
  | "destabilized"
  | "currently_stabilized"
  | "missing_registration"
  | "temporary_exemption"
  | "expired_j51"
  | "expired_421a"
  | "mci";

export const TIMELINE_PILL_TYPES: readonly TimelinePillType[] = [
  "violation",
  "destabilized",
  "currently_stabilized",
  "missing_registration",
  "temporary_exemption",
  "expired_j51",
  "expired_421a",
  "mci",
] as const;

export type TimelineElementProps = {
  variant: "primary" | "secondary";
  year: number;
  endYear?: number;
  title: ReactNode;
  description?: ReactNode;
  footnote?: ReactNode;
  whatThisMeans?: ReactNode;
  pills?: TimelinePillType[];
  defaultOpen?: boolean;
  className?: string;
};

const PILL_STYLE_CLASS: Record<TimelinePillType, string> = {
  violation: "timeline-element__pill--violation",
  destabilized: "timeline-element__pill--destabilized",
  currently_stabilized: "timeline-element__pill--currently-stabilized",
  missing_registration: "timeline-element__pill--status",
  temporary_exemption: "timeline-element__pill--status",
  expired_j51: "timeline-element__pill--status",
  expired_421a: "timeline-element__pill--status",
  mci: "timeline-element__pill--status",
};

const formatYearRange = (year: number, endYear?: number): string =>
  endYear != null ? `${year}-${endYear}` : String(year);

export const TimelineElement = ({
  variant,
  year,
  endYear,
  title,
  description,
  footnote,
  whatThisMeans,
  pills = [],
  defaultOpen = false,
  className,
}: TimelineElementProps) => {
  const { _ } = useLingui();
  const panelId = useId();
  const isExpandable = description != null;
  const [isOpen, setIsOpen] = useState(defaultOpen && isExpandable);

  const yearLabel = formatYearRange(year, endYear);

  const pillLabel = (type: TimelinePillType): string => {
    switch (type) {
      case "violation":
        return _(msg`Potential Violation`);
      case "destabilized":
        return _(msg`Destabilized`);
      case "currently_stabilized":
        return _(msg`Currently Rent Stabilized`);
      case "missing_registration":
        return _(msg`Missing registration`);
      case "temporary_exemption":
        return _(msg`Temporary exemption`);
      case "expired_j51":
        return _(msg`J51 expiration`);
      case "expired_421a":
        return _(msg`421-a expiration`);
      case "mci":
        return _(msg`Major Capital Improvement`);
    }
  };

  const toggleLabel =
    variant === "primary"
      ? isOpen
        ? _(msg`Hide supporting evidence`)
        : _(msg`Show supporting evidence`)
      : _(msg`Details`);

  const toggle = () => {
    if (!isExpandable) return;
    setIsOpen((open) => !open);
  };

  const showImplications = variant === "primary" && whatThisMeans != null;

  return (
    <div
      className={classNames(
        "timeline-element",
        `timeline-element--${variant}`,
        isOpen && "timeline-element--open",
        className
      )}
      data-testid="timeline-element"
    >
      <div className="timeline-element__rail" aria-hidden="true">
        <span className="timeline-element__rail-line" />
        <span className="timeline-element__rail-dot" />
      </div>

      <div className="timeline-element__body">
        <div className="timeline-element__header">
          <span className="timeline-element__year">{yearLabel}</span>
          {pills.length > 0 ? (
            <div className="timeline-element__pills">
              {pills.map((type) => (
                <Pill
                  key={type}
                  color="none"
                  className={classNames(
                    "timeline-element__pill",
                    PILL_STYLE_CLASS[type]
                  )}
                >
                  {pillLabel(type)}
                </Pill>
              ))}
            </div>
          ) : null}
        </div>

        <div className="timeline-element__title">{title}</div>

        {isExpandable ? (
          <>
            <div className="timeline-element__toggle">
              {variant === "primary" ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  labelText={toggleLabel}
                  labelIcon="chevronDown"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={toggle}
                  className="timeline-element__toggle-button"
                />
              ) : (
                <LinkStyledButton
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={toggle}
                  className="timeline-element__toggle-link"
                >
                  {toggleLabel}
                  <Icon icon="chevronDown" aria-hidden="true" />
                </LinkStyledButton>
              )}
            </div>

            <div
              id={panelId}
              className="timeline-element__panel"
              hidden={!isOpen}
            >
              <div className="timeline-element__description">{description}</div>
              {footnote != null ? (
                <div className="timeline-element__footnote">{footnote}</div>
              ) : null}
              {showImplications ? (
                <div className="timeline-element__implications">
                  <p className="timeline-element__implications-heading">
                    <Trans>What this means for you</Trans>
                  </p>
                  <div className="timeline-element__implications-body">
                    {whatThisMeans}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
