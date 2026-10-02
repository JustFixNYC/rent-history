import { useLingui } from "@lingui/react";
import React from "react";

import { RouterJfclLink, RouterJfclLinkProps } from "./RouterJfclLink";

export type LocaleLinkProps = Omit<RouterJfclLinkProps, "to"> & {
  /** Path without locale prefix, e.g. "privacy_policy" → /{locale}/privacy_policy */
  to: string;
};

export const LocaleLink = React.forwardRef<HTMLAnchorElement, LocaleLinkProps>(
  ({ to, children, ...props }, ref) => {
    const { i18n } = useLingui();
    const localePath = `/${i18n.locale}/${to.replace(/^\//, "")}`;

    return (
      <RouterJfclLink {...props} ref={ref} to={localePath}>
        {children}
      </RouterJfclLink>
    );
  }
);

LocaleLink.displayName = "LocaleLink";
