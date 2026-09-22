import classNames from "classnames";
import type { ReactNode } from "react";

import "./ContentBox.scss";

export type ContentBoxVariant = "prominent" | "info";

export type ContentBoxProps = {
  className?: string;
  variant?: ContentBoxVariant;
  title?: ReactNode;
  titleIcon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
};

export const ContentBox = ({
  className,
  variant = "prominent",
  title,
  titleIcon,
  children,
  action,
  footer,
}: ContentBoxProps) => {
  const isInfo = variant === "info";
  const hasHeader = Boolean(title || titleIcon);

  return (
    <div
      className={classNames(
        "content-box",
        `content-box--${variant}`,
        className
      )}
    >
      {isInfo && hasHeader ? (
        <div className="content-box__header">
          {titleIcon ? (
            <span className="content-box__title-icon">{titleIcon}</span>
          ) : null}
          {title ? <div className="content-box__title">{title}</div> : null}
        </div>
      ) : null}

      {isInfo ? (
        <div
          className={classNames("content-box__content", {
            "content-box__content--indented": hasHeader,
          })}
        >
          <div className="content-box__body">{children}</div>
          {action ? <div className="content-box__action">{action}</div> : null}
        </div>
      ) : (
        <>
          <div className="content-box__text">
            {title ? <div className="content-box__title">{title}</div> : null}
            <div className="content-box__body">{children}</div>
          </div>
          {action ? <div className="content-box__action">{action}</div> : null}
        </>
      )}

      {footer ? <div className="content-box__footer">{footer}</div> : null}
    </div>
  );
};
