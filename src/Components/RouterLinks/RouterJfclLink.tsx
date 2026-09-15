import { Link as JfclLink, LinkProps } from "@justfixnyc/component-library";
import React from "react";
import { To } from "react-router-dom";

import {
  RouterAnchorOptions,
  useRouterAnchorProps,
} from "./useRouterAnchorProps";

export type RouterJfclLinkProps = Omit<LinkProps, "href" | "navigate"> &
  RouterAnchorOptions & {
    to: To;
  };

export const RouterJfclLink = React.forwardRef<
  HTMLAnchorElement,
  RouterJfclLinkProps
>(({ to, replace, state, target, onClick, ...rest }, ref) => {
  const anchorProps = useRouterAnchorProps(to, {
    replace,
    state,
    target,
    onClick,
  });

  return <JfclLink {...rest} ref={ref} target={target} {...anchorProps} />;
});

RouterJfclLink.displayName = "RouterJfclLink";
