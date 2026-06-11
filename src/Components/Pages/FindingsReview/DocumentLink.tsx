import { useState } from "react";
import classNames from "classnames";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Icon } from "@justfixnyc/component-library";

import { PlaceholderInfoModal } from "./PlaceholderInfoModal";

type DocumentLinkProps = {
  className?: string;
};

export const DocumentLink = ({ className }: DocumentLinkProps) => {
  const { _ } = useLingui();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={classNames("findings-review-inline-link", className)}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        <Trans>your rent history</Trans>
        <Icon icon="memoPad" aria-hidden="true" />
      </button>
      <PlaceholderInfoModal
        isOpen={isOpen}
        title={_(msg`Your rent history`)}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
