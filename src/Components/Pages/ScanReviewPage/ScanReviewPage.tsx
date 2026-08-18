import { AnalysisFlowProgress } from "../../AnalysisFlowProgress/AnalysisFlowProgress";
import { ScanReviewScreen } from "./ScanReviewScreen";

const noop = () => {};

/**
 * Scan review route shell. Orchestration (hooks, API polling, navigation) is
 * wired in task 3; this stub mounts the relocated presentational components.
 */
const ScanReviewPage = () => {
  return (
    <div id="scan-review-page" className="scan-review-page">
      <div className="scan-review-page__progress">
        <AnalysisFlowProgress stepId="scan-review" />
      </div>
      <ScanReviewScreen
        pages={[]}
        missingYearRanges={[]}
        processingComplete={false}
        isLoading
        onRescanPages={noop}
        onRestart={noop}
        onNext={noop}
        onAddMore={noop}
        nextDisabled
      />
    </div>
  );
};

export default ScanReviewPage;
