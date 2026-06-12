import { Trans } from "@lingui/react/macro";

import {
  useRhFindingsState,
} from "../../../api/account/hooks/findingsReview";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";

import { FindingReviewFlow } from "./FindingReviewFlow";
import { FINDING_MODULES } from "./types/registry";
import "./FindingsReview.scss";

const FindingsReviewPage = () => {
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  const { data, isLoading, isError } = useRhFindingsState({
    accessToken: session?.accessToken,
    historyId: historyId ?? undefined,
  });

  const currentFinding = data?.findings_current[0];
  const module =
    currentFinding?.type != null
      ? FINDING_MODULES[currentFinding.type as keyof typeof FINDING_MODULES]
      : undefined;

  return (
    <main className="findings-review-page">
      <div className="findings-review-body">
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
