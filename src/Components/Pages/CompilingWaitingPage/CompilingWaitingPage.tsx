import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { useNavigate } from "react-router-dom";
import { CalloutBox, Icon } from "@justfixnyc/component-library";
import classNames from "classnames";

import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { FlowNav } from "../../FlowNav";
import {
  getRhAuthSession,
  getRhHistoryId,
} from "../../../session/rhSessionStorage";
import { historyResumePath } from "../../../utils/historyResumePath";
import { useScanPipelineStatus } from "../../../hooks/useScanPipelineStatus";

import {
  deriveCompilingMilestones,
  getCompilingSubstepIndex,
  type CompilingMilestoneState,
} from "./deriveCompilingMilestones";

import "./CompilingWaitingPage.scss";

const MILESTONE_ROWS = [
  {
    key: "quality" as const,
    label: msg`Checking scan quality`,
    helper: msg`We review your scans to make sure every page is clear and complete before analysis.`,
  },
  {
    key: "extracting" as const,
    label: msg`Extracting data`,
  },
  {
    key: "analyzing" as const,
    label: msg`Analyzing rent history`,
  },
];

type MilestoneRowProps = {
  label: string;
  helper?: string;
  state: CompilingMilestoneState;
};

const MilestoneRow = ({ label, helper, state }: MilestoneRowProps) => (
  <li
    className={classNames(
      "compiling-waiting-page__milestone",
      `compiling-waiting-page__milestone--${state}`
    )}
  >
    <span className="compiling-waiting-page__milestone-icon" aria-hidden="true">
      {state === "complete" ? (
        <Icon icon="check" />
      ) : state === "in_progress" ? (
        <Icon icon="spinner" />
      ) : null}
    </span>
    <div className="compiling-waiting-page__milestone-copy">
      <p className="compiling-waiting-page__milestone-label">{label}</p>
      {helper ? (
        <p className="compiling-waiting-page__milestone-helper">{helper}</p>
      ) : null}
    </div>
  </li>
);

const CompilingWaitingPage = () => {
  const { _, i18n } = useLingui();
  const navigate = useNavigate();
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();

  const { data, status, isError, showFlowNav } = useScanPipelineStatus({
    accessToken: session?.accessToken,
    historyId: historyId ?? undefined,
  });

  const milestones = deriveCompilingMilestones(status);
  const substepIndex = getCompilingSubstepIndex(milestones);
  const showFailedCallout = status === "failed";

  const handleRestart = () => {
    navigate(`/${i18n.locale}/scanner`, {
      state: { postCompileReturn: true },
    });
  };

  const handleNext = () => {
    if (!data) return;
    navigate(historyResumePath(i18n.locale, data.last_step_reached));
  };

  return (
    <div id="compiling-waiting-page" className="compiling-waiting-page">
      <section className="compiling-waiting-page__body">
        <AnalysisFlowProgress
          stepId="compiling"
          substepIndex={substepIndex}
          substepCount={3}
        />

        {showFailedCallout ? (
          <CalloutBox
            className="compiling-waiting-page__error-callout"
            title={<Trans>Unable to compile your rent history</Trans>}
            headingLevel={2}
          >
            <p>
              <Trans>
                Something went wrong while processing your scans. Please try
                scanning again or contact support if this keeps happening.
              </Trans>
            </p>
          </CalloutBox>
        ) : null}

        {isError && !showFailedCallout ? (
          <CalloutBox
            className="compiling-waiting-page__error-callout"
            title={<Trans>Unable to load compile status</Trans>}
            headingLevel={2}
          >
            <p>
              <Trans>Please refresh the page or try again in a moment.</Trans>
            </p>
          </CalloutBox>
        ) : null}

        <article
          className="compiling-waiting-page__card"
          data-testid="compiling-waiting-card"
        >
          <header className="compiling-waiting-page__card-header">
            <h2>
              <Trans>Securely compiling your rent history</Trans>
            </h2>
            <p>
              <Trans>This may take up to 30 seconds.</Trans>
            </p>
          </header>

          <ul
            className="compiling-waiting-page__milestones"
            aria-label={_(msg`Compiling progress`)}
          >
            {MILESTONE_ROWS.map((row) => (
              <MilestoneRow
                key={row.key}
                label={_(row.label)}
                helper={row.helper ? _(row.helper) : undefined}
                state={milestones[row.key]}
              />
            ))}
          </ul>
        </article>

        <aside
          className="compiling-waiting-page__sms-callout"
          data-testid="compiling-sms-callout"
        >
          <Icon
            icon="mobileScreenButton"
            className="compiling-waiting-page__sms-icon"
            aria-hidden="true"
          />
          <p>
            <Trans>
              We&apos;ll send you a text when your results are ready, in case
              you close this page.
            </Trans>
          </p>
        </aside>

        {showFlowNav ? (
          <FlowNav
            className="compiling-waiting-page__flow-nav"
            backLabel={<Trans>Restart</Trans>}
            nextLabel={_(msg`Next`)}
            onBack={handleRestart}
            onNext={handleNext}
            nextDisabled={!data}
          />
        ) : null}
      </section>
    </div>
  );
};

export default CompilingWaitingPage;
