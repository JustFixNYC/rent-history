import { useEffect, useState } from "react";
import { Trans } from "@lingui/react/macro";
import { useSearchParams } from "react-router-dom";

import { useRhFindingsState } from "../../../api/account/hooks/findingsReview";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { getFindingsReviewSubsteps } from "../../AnalysisFlowProgress/analysisFlow";

import { FindingReviewFlow } from "./FindingReviewFlow";
import { getCurrentFindingFromQueue } from "./getCurrentFindingFromQueue";
import { FINDING_MODULES } from "./types/registry";
import "./FindingsReview.scss";

const FindingsReviewPage = () => {
  const [searchParams] = useSearchParams();
  const resumeHint = searchParams.get("finding_id");

  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  const { data, isLoading, isError } = useRhFindingsState({
    accessToken: session?.accessToken,
    historyId: historyId ?? undefined,
  });

  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    setActiveFindingId((current) => {
      if (current != null) {
        const stillInFindings = data.findings_current.some(
          (finding) => finding.id === current
        );
        if (stillInFindings) {
          return current;
        }
      }

      const hintedId =
        resumeHint != null &&
        data.findings_current.some((finding) => finding.id === resumeHint)
          ? resumeHint
          : null;

      return hintedId ?? data.review_queue.ordered_ids[0] ?? null;
    });
  }, [data, resumeHint]);

  const currentFinding = getCurrentFindingFromQueue(
    data,
    activeFindingId ?? resumeHint
  );
  const module =
    currentFinding?.type != null
      ? FINDING_MODULES[currentFinding.type as keyof typeof FINDING_MODULES]
      : undefined;

  const { substepIndex, substepCount } = getFindingsReviewSubsteps(data);

  return (
    <main className="findings-review-page">
      <div className="findings-review-body">
        <AnalysisFlowProgress
          stepId="findings-review"
          substepIndex={substepIndex}
          substepCount={substepCount}
        />
        {isLoading ? (
          <p>
            <Trans>Loading findings…</Trans>
          </p>
        ) : null}
        {isError ? (
          <p>
            <Trans>Unable to load findings state.</Trans>
          </p>
        ) : null}
        {currentFinding && module && session?.accessToken && historyId ? (
          <FindingReviewFlow
            key={currentFinding.id}
            module={module}
            finding={currentFinding}
            accessToken={session.accessToken}
            historyId={historyId}
            onAdvanceToFinding={setActiveFindingId}
          />
        ) : null}
        {currentFinding && !module ? (
          <p data-testid="findings-review-unsupported">
            <Trans>Unsupported finding type: {currentFinding.type}</Trans>
          </p>
        ) : null}
      </div>
    </main>
  );
};

export default FindingsReviewPage;
