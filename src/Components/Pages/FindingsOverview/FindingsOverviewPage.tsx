import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Icon } from "@justfixnyc/component-library";

import { isAccountApiError } from "../../../api/account";
import { useRhFindingsState } from "../../../api/account/hooks/findingsReview";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import "./FindingsOverviewPage.scss";

const FindingsOverviewPage = () => {
  const { i18n, _ } = useLingui();
  const navigate = useNavigate();
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();

  const { data, isLoading, isError, error } = useRhFindingsState({
    accessToken: session?.accessToken,
    historyId: historyId ?? undefined,
  });

  const findingsNotInitialized =
    isError &&
    isAccountApiError(error) &&
    error.errorCode === "findings_not_initialized";

  useEffect(() => {
    if (findingsNotInitialized) {
      navigate(`/${i18n.locale}/rent-questions`, { replace: true });
    }
  }, [findingsNotInitialized, i18n.locale, navigate]);

  const hasFindings = (data?.findings_current.length ?? 0) > 0;

  const handleBack = () => {
    navigate(`/${i18n.locale}/rent-questions`);
  };

  const handlePrimary = () => {
    if (hasFindings) {
      navigate(`/${i18n.locale}/findings-review`);
      return;
    }
    navigate(`/${i18n.locale}/report`);
  };

  if (findingsNotInitialized) {
    return null;
  }

  return (
    <div id="findings-overview-page">
      <section className="postscan-body">
        <AnalysisFlowProgress stepId="findings-overview" />

        {isLoading ? (
          <p>
            <Trans>Loading findings…</Trans>
          </p>
        ) : null}

        {isError && !findingsNotInitialized ? (
          <p role="alert">
            <Trans>Unable to load findings.</Trans>
          </p>
        ) : null}

        {data ? (
          <>
            <div
              className={`findings-overview-info-box ${
                hasFindings
                  ? "findings-overview-info-box--with-findings"
                  : "findings-overview-info-box--no-findings"
              }`}
              data-testid="findings-overview-info-box"
            >
              {hasFindings ? (
                <>
                  <h2>
                    <Trans>
                      We&apos;ve found potential violations in your
                      apartment&apos;s rent history.
                    </Trans>
                  </h2>
                  <p>
                    <Trans>
                      Next, we will walk through each potential violation to
                      check if there is a way they may or may not be explained.
                    </Trans>
                  </p>
                </>
              ) : (
                <>
                  <h2>
                    <Trans>
                      We have not found any potential violations in your
                      apartment&apos;s rent history.
                    </Trans>
                  </h2>
                  <p>
                    <Trans>Next, your report will provide more details</Trans>
                  </p>
                </>
              )}
            </div>

            {hasFindings ? (
              <section className="findings-overview-importance">
                <h2>
                  <Trans>Why this is important</Trans>
                </h2>
                <p>
                  <Trans>
                    Your answers directly inform our assessment of any potential
                    violations that may appear in our final report.
                  </Trans>
                </p>
              </section>
            ) : null}

            <div className="postscan-actions">
              <button
                type="button"
                className="postscan-link-btn"
                onClick={handleBack}
              >
                <Icon icon="chevronLeft" />
                <Trans>Back</Trans>
              </button>
              <Button
                className="postscan-primary-btn"
                labelText={
                  hasFindings ? _(msg`Start review`) : _(msg`View report`)
                }
                onClick={handlePrimary}
              />
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
};

export default FindingsOverviewPage;
