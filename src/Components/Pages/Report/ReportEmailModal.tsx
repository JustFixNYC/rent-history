import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { InfoModal } from "../../InfoModal/InfoModal";
import type { ReportPdfLocale } from "../../../api/account";

import {
  ReportEmailForm,
  type ReportEmailFormOutcome,
} from "./ReportEmailForm";

export type ReportEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  historyId: string;
  locale: ReportPdfLocale;
  onOutcome: (outcome: ReportEmailFormOutcome) => void;
  onSubmitStart?: () => void;
};

export const ReportEmailModal = ({
  isOpen,
  onClose,
  accessToken,
  historyId,
  locale,
  onOutcome,
  onSubmitStart,
}: ReportEmailModalProps) => {
  const { _ } = useLingui();

  return (
    <InfoModal
      isOpen={isOpen}
      title={_(msg`Email PDF report`)}
      onClose={onClose}
    >
      {isOpen ? (
        <ReportEmailForm
          accessToken={accessToken}
          historyId={historyId}
          locale={locale}
          embeddedInModal
          onOutcome={onOutcome}
          onSubmitStart={onSubmitStart}
        />
      ) : null}
    </InfoModal>
  );
};
