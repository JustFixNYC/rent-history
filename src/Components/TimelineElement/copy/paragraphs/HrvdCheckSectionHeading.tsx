import { Trans } from "@lingui/react/macro";

import { SectionHeading } from "./SectionHeading";

type HrvdCheckSectionHeadingProps = {
  year: number;
};

export const HrvdCheckSectionHeading = ({
  year,
}: HrvdCheckSectionHeadingProps) => (
  <SectionHeading>
    <Trans id="timeline.copy.hrvd_check_heading">
      First, we checked for high rent vacancy destabilization in year {year}
    </Trans>
  </SectionHeading>
);
