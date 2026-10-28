import { Trans } from "@lingui/react/macro";

export const SuccessionHeading = () => (
  <Trans id="findings.shared.succession.heading">
    Now, let&apos;s check if you took succession of this apartment
  </Trans>
);

type SuccessionBodyProps = {
  year: number;
};

export const SuccessionBody = ({ year }: SuccessionBodyProps) => (
  <p className="finding-step-copy">
    <Trans id="findings.shared.succession.body">
      Did you inherit the lease through a process called
      &ldquo;Succession&rdquo; from someone who was on the lease in {year}?
    </Trans>
  </p>
);
