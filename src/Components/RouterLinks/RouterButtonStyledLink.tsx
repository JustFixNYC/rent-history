import {
  ButtonStyledLink,
  ButtonStyledLinkProps,
} from "@justfixnyc/component-library";
import React from "react";
import { To } from "react-router-dom";

import {
  RouterAnchorOptions,
  useRouterAnchorProps,
} from "./useRouterAnchorProps";

export type RouterButtonStyledLinkProps = Omit<
  ButtonStyledLinkProps,
  "href" | "navigate"
> &
  RouterAnchorOptions & {
    to: To;
  };

export const RouterButtonStyledLink = React.forwardRef<
  HTMLAnchorElement,
  RouterButtonStyledLinkProps
>(({ to, replace, state, target, onClick, ...rest }, ref) => {
  const anchorProps = useRouterAnchorProps(to, {
    replace,
    state,
    target,
    onClick,
  });

  return (
    <ButtonStyledLink {...rest} ref={ref} target={target} {...anchorProps} />
  );
});

RouterButtonStyledLink.displayName = "RouterButtonStyledLink";
