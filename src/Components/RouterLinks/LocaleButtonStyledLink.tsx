import { useLingui } from "@lingui/react";
import React from "react";

import {
  RouterButtonStyledLink,
  RouterButtonStyledLinkProps,
} from "./RouterButtonStyledLink";

export type LocaleButtonStyledLinkProps = Omit<
  RouterButtonStyledLinkProps,
  "to"
> & {
  /** Path without locale prefix, e.g. "request" → /{locale}/request */
  to: string;
};

export const LocaleButtonStyledLink = React.forwardRef<
  HTMLAnchorElement,
  LocaleButtonStyledLinkProps
>(({ to, ...props }, ref) => {
  const { i18n } = useLingui();
  const localePath = `/${i18n.locale}/${to.replace(/^\//, "")}`;

  return <RouterButtonStyledLink {...props} ref={ref} to={localePath} />;
});

LocaleButtonStyledLink.displayName = "LocaleButtonStyledLink";
