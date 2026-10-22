import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";

import { ConfirmModal } from "../../../ConfirmModal/ConfirmModal";

export type SkipOrRescanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onRescan: () => void;
  skipDisabled?: boolean;
  rescanDisabled?: boolean;
};

export const SkipOrRescanModal = ({
  isOpen,
  onClose,
  onSkip,
  onRescan,
  skipDisabled = false,
  rescanDisabled = false,
}: SkipOrRescanModalProps) => {
  const { _ } = useLingui();

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={<Trans>Skip or re-scan?</Trans>}
      body={
        <Trans>
          You can continue with your existing scan results, or clear all scanned
          pages and start over.
        </Trans>
      }
      confirmAction={{
        labelText: _(msg`Skip`),
        variant: "primary",
        onClick: onSkip,
        disabled: skipDisabled,
      }}
      cancelAction={{
        labelText: _(msg`Re-scan`),
        variant: "secondary",
        onClick: onRescan,
        disabled: rescanDisabled,
      }}
      onClose={onClose}
    />
  );
};
