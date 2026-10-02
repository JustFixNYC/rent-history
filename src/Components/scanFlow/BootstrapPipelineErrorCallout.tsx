import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button, CalloutBox } from "@justfixnyc/component-library";
import classNames from "classnames";

import "./BootstrapPipelineErrorCallout.scss";

export type BootstrapPipelineErrorCalloutProps = {
  onRetry: () => void;
  className?: string;
  testId?: string;
};

export const BootstrapPipelineErrorCallout = ({
  onRetry,
  className,
  testId = "bootstrap-pipeline-error",
}: BootstrapPipelineErrorCalloutProps) => {
  const { _ } = useLingui();

  return (
    <div
      className={classNames("bootstrap-pipeline-error", className)}
      data-testid={testId}
    >
      <CalloutBox
        className="bootstrap-pipeline-error__callout"
        title={<Trans>Unable to load compile status</Trans>}
        headingLevel={2}
      >
        <p>
          <Trans>Please try again in a moment.</Trans>
        </p>
        <Button
          labelText={_(msg`Try again`)}
          variant="primary"
          onClick={onRetry}
        />
      </CalloutBox>
    </div>
  );
};
