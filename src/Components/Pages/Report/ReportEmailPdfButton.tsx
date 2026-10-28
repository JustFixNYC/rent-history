import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Button } from "@justfixnyc/component-library";

export type ReportEmailPdfButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const ReportEmailPdfButton = ({
  onClick,
  disabled = false,
}: ReportEmailPdfButtonProps) => {
  const { _ } = useLingui();

  return (
    <Button
      className="report-page__email-cta"
      variant="secondary"
      labelText={_(msg`Email PDF report`)}
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="dialog"
    />
  );
};
