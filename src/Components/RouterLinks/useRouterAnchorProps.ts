import React from "react";
import { To, useHref, useLinkClickHandler } from "react-router-dom";

export type RouterAnchorOptions = {
  replace?: boolean;
  state?: unknown;
  target?: React.HTMLAttributeAnchorTarget;
};

export function useRouterAnchorProps(
  to: To,
  {
    replace = false,
    state,
    target,
    onClick,
  }: RouterAnchorOptions & {
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  } = {}
): {
  href: string;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
} {
  const href = useHref(to);
  const handleClick = useLinkClickHandler(to, { replace, state, target });

  return {
    href,
    onClick: (event) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        handleClick(event);
      }
    },
  };
}
