import { useState, type ReactNode } from "react";
import classNames from "classnames";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { LinkStyledButton } from "@justfixnyc/component-library";

import { InfoModal } from "../InfoModal/InfoModal";

import "./GlossaryLink.scss";

type GlossaryLinkProps = {
  term: ReactNode;
  modalTitle?: string;
  className?: string;
};

export const GlossaryLink = ({
  term,
  modalTitle,
  className,
}: GlossaryLinkProps) => {
  const { _ } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const resolvedTitle =
    modalTitle ?? (typeof term === "string" ? term : _(msg`Glossary`));

  return (
    <>
      <LinkStyledButton
        className={classNames("glossary-link", className)}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        {term}
        <span className="glossary-link__icon" aria-hidden="true">
          {" "}
          (i)
        </span>
      </LinkStyledButton>
      <InfoModal
        isOpen={isOpen}
        title={resolvedTitle}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
