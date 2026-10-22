import { ButtonStyledLink } from "@justfixnyc/component-library";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import classNames from "classnames";
import type { ReactNode } from "react";

import { LocaleButtonStyledLink } from "../../../RouterLinks";
import { goodCauseNycUrl, rentHistoryRequestUrl } from "./rightsUrls";
import type { RightsCtaCardVariant } from "./rightsSectionTypes";
import "./RightsCtaCard.scss";

export type RightsCtaCardProps = {
  variant: RightsCtaCardVariant;
  title: ReactNode;
  children: ReactNode;
  buttonLabel?: string;
  className?: string;
};

export const RightsCtaCard = ({
  variant,
  title,
  children,
  buttonLabel,
  className,
}: RightsCtaCardProps) => {
  const { i18n, _ } = useLingui();
  const locale = i18n.locale;

  const isPurple = variant === "analyze";

  return (
    <aside
      className={classNames(
        "rights-cta-card",
        isPurple ? "rights-cta-card--purple" : "rights-cta-card--tan",
        className
      )}
    >
      <h3 className="rights-cta-card__title">{title}</h3>
      <div className="rights-cta-card__body">{children}</div>
      <div className="rights-cta-card__action">
        {variant === "analyze" ? (
          <LocaleButtonStyledLink
            to="analyze/login"
            variant="primary"
            labelText={buttonLabel ?? _(msg`Analyze your rent history`)}
          />
        ) : null}
        {variant === "rentHistoryRequest" ? (
          <ButtonStyledLink
            variant="primary"
            href={rentHistoryRequestUrl(locale)}
            target="_blank"
            rel="noreferrer"
            labelText={buttonLabel ?? _(msg`Get your rent history`)}
          />
        ) : null}
        {variant === "goodCause" ? (
          <ButtonStyledLink
            variant="primary"
            href={goodCauseNycUrl}
            target="_blank"
            rel="noreferrer"
            labelText={buttonLabel ?? _(msg`Learn more`)}
          />
        ) : null}
      </div>
    </aside>
  );
};
