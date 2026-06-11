import { Trans } from "@lingui/react/macro";

import { useRhFindingsState } from "../../../api/account/hooks/findingsReview";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";

const FindingsReviewPage = () => {
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  const { data, isLoading, isError } = useRhFindingsState({
    accessToken: session?.accessToken,
    historyId: historyId ?? undefined,
  });

  const currentFinding = data?.findings_current[0];

  return (
    <main className="findings-review-page">
      <h1>
        <Trans>Findings review</Trans>
      </h1>
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
      {currentFinding ? (
        <p data-testid="findings-review-placeholder">
          Pilot placeholder — reviewing {currentFinding.type} (
          {currentFinding.finding_year})
        </p>
      ) : null}
    </main>
  );
};

export default FindingsReviewPage;
