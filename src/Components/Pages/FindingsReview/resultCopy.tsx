import type { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";

import type { FindingResult } from "./types/finding";
import type { FindingResultContent } from "./types/findingModule";

export function getFindingResultTitle(result: FindingResult): ReactNode {
  switch (result) {
    case "potential_violation":
      return (
        <Trans id="findings.result.potential_violation.title">
          Potential violation found
        </Trans>
      );
    case "no_violation":
      return (
        <Trans id="findings.result.no_violation.title">
          No violation found
        </Trans>
      );
    case "dismissed":
      return (
        <Trans id="findings.result.dismissed.title">No violation found</Trans>
      );
  }
}

export function buildFindingResultContent(
  result: FindingResult,
  bodies: Record<FindingResult, ReactNode>
): FindingResultContent {
  return {
    title: getFindingResultTitle(result),
    body: bodies[result],
  };
}
