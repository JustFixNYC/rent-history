import { useEffect, useId, useRef, type ReactNode } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@justfixnyc/component-library";

import "./InfoModal.scss";

type InfoModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
};

export const InfoModal = ({
  isOpen,
  title,
  onClose,
  children,
}: InfoModalProps) => {
  const { _ } = useLingui();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="info-modal"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <h2 id={titleId} className="info-modal__title">
        {title}
      </h2>
      {children ?? (
        <p className="info-modal__body">
          <Trans>Coming soon</Trans>
        </p>
      )}
      <div className="info-modal__actions">
        <Button labelText={_(msg`Close`)} onClick={onClose} />
      </div>
    </dialog>
  );
};
