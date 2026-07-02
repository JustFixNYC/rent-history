import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Button } from "@justfixnyc/component-library";

import "./ConfirmModal.scss";

type ConfirmModalButtonVariant = "primary" | "secondary" | "tertiary";

export type ConfirmModalAction = {
  labelText: string;
  onClick: () => void;
  variant?: ConfirmModalButtonVariant;
  disabled?: boolean;
};

export type ConfirmModalProps = {
  isOpen: boolean;
  title: ReactNode;
  body?: ReactNode;
  /** Right/Top action — the affirmative choice (e.g. Delete / Log out). */
  confirmAction: ConfirmModalAction;
  /** Left/Bottom action — typically dismissive (e.g. Cancel). */
  cancelAction: ConfirmModalAction;
  onClose: () => void;
};

/**
 * Reusable transactional confirm dialog following the native `<dialog>`
 * pattern used by `InfoModal` / `FindingResultModal`. Title + optional body,
 * a close (X) button, and two configurable action buttons.
 */
export const ConfirmModal = ({
  isOpen,
  title,
  body,
  confirmAction,
  cancelAction,
  onClose,
}: ConfirmModalProps) => {
  const { _ } = useLingui();
  const titleId = useId();
  const bodyId = useId();
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
      className="confirm-modal"
      aria-labelledby={titleId}
      aria-describedby={body ? bodyId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <Button
        variant="tertiary"
        className="confirm-modal__close"
        labelText={_(msg`Close`)}
        onClick={onClose}
        labelIcon="xmark"
        iconOnly
      />
      <h2 id={titleId} className="confirm-modal__title">
        {title}
      </h2>
      {body ? (
        <div id={bodyId} className="confirm-modal__body">
          {body}
        </div>
      ) : null}
      <div className="confirm-modal__actions">
        <Button
          className="confirm-modal__action"
          labelText={confirmAction.labelText}
          variant={confirmAction.variant ?? "primary"}
          disabled={confirmAction.disabled}
          onClick={confirmAction.onClick}
        />
        <Button
          className="confirm-modal__action"
          labelText={cancelAction.labelText}
          variant={cancelAction.variant ?? "secondary"}
          disabled={cancelAction.disabled}
          onClick={cancelAction.onClick}
        />
      </div>
    </dialog>
  );
};
