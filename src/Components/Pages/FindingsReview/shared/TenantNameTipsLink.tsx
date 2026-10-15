import { useState } from "react";
import classNames from "classnames";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { LinkStyledButton } from "@justfixnyc/component-library";

import { InfoModal } from "../../../InfoModal/InfoModal";

import "../../../GlossaryLink/GlossaryLink.scss";

type TenantNameTipsLinkProps = {
  className?: string;
};

export const TenantNameTipsLink = ({ className }: TenantNameTipsLinkProps) => {
  const { _ } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const modalTitle = _(msg`Tips for reviewing tenant names`);

  return (
    <>
      <LinkStyledButton
        className={classNames("glossary-link", className)}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        <Trans id="findings.tenant_name_tips.link">
          Tips for reviewing tenant names
        </Trans>
      </LinkStyledButton>
      <InfoModal
        isOpen={isOpen}
        title={modalTitle}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
