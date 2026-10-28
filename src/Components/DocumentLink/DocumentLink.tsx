import { useState, type ReactNode } from "react";
import classNames from "classnames";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Icon } from "@justfixnyc/component-library";

import { InfoModal } from "../InfoModal/InfoModal";
import { RentHistoryPagesModalContent } from "./RentHistoryPagesModalContent";

import "./DocumentLink.scss";

type DocumentLinkProps = {
  className?: string;
  label?: ReactNode;
};

export const DocumentLink = ({ className, label }: DocumentLinkProps) => {
  const { _ } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const linkLabel = label ?? <Trans>your rent history</Trans>;

  return (
    <>
      <button
        type="button"
        className={classNames("document-link", className)}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        {linkLabel}
        <Icon icon="memoPad" aria-hidden="true" />
      </button>
      <InfoModal
        isOpen={isOpen}
        title={_(msg`Your rent history`)}
        onClose={() => setIsOpen(false)}
      >
        {isOpen ? <RentHistoryPagesModalContent enabled /> : null}
      </InfoModal>
    </>
  );
};
