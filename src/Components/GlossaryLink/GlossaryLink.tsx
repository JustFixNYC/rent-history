import { useState, type ReactNode } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Icon, LinkStyledButton } from "@justfixnyc/component-library";

import { InfoModal } from "../InfoModal/InfoModal";

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
        className={className}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        {term}
        <Icon
          icon="circleInfo"
          className="jfcl-link__icon"
          aria-hidden="true"
        />
      </LinkStyledButton>
      <InfoModal
        isOpen={isOpen}
        title={resolvedTitle}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
