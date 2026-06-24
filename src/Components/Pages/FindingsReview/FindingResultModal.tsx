import { useEffect, useId, useRef } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, Icon } from "@justfixnyc/component-library";
import type { ReactNode } from "react";

import { FindingResultPanel } from "./FindingResultPanel";
import type { FindingResult } from "./types/finding";

export type FindingResultModalProps = {
  isOpen: boolean;
  result: FindingResult;
  title: ReactNode;
  body: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
};

export const FindingResultModal = ({
  isOpen,
  result,
  title,
  body,
  onBack,
  onNext,
  nextLabel,
}: FindingResultModalProps) => {
  const { _ } = useLingui();
  const resolvedNextLabel = nextLabel ?? _(msg`Next`);
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
      className="finding-result-modal"
      aria-labelledby={titleId}
      data-testid="finding-result-modal"
      onCancel={(event) => {
        event.preventDefault();
      }}
    >
      <FindingResultPanel
        result={result}
        title={title}
        body={body}
        className="finding-result-panel--in-modal"
      />
      <nav
        className="finding-result-modal__actions"
        aria-label={_(msg`Finding result navigation`)}
      >
        <button
          type="button"
          className="finding-result-modal__back"
          onClick={onBack}
        >
          <Icon icon="chevronLeft" aria-hidden="true" />
          <Trans>Back</Trans>
        </button>
        <Button
          className="finding-result-modal__next"
          labelText={resolvedNextLabel}
          onClick={onNext}
        />
      </nav>
    </dialog>
  );
};
