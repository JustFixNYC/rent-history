import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { AccountApiError } from "../../../../api/account/errors";
import { accountQueryKeys } from "../../../../api/account/queryKeys";
import type { RhFindingResult } from "../../../../api/account/types";
import { AnalysisFlowProgress } from "../../../AnalysisFlowProgress/AnalysisFlowProgress";
import { getFindingsReviewSubsteps } from "../../../AnalysisFlowProgress/analysisFlow";

import findingExamples from "../__fixtures__/findingExamples.json";
import {
  FindingReviewFlow,
  type DevValidateMutate,
} from "../FindingReviewFlow";
import "../FindingsReview.scss";
import { FINDING_MODULES, type FindingModuleType } from "../types/registry";
import type { Finding, FindingsStateResponse } from "../types/finding";

import "./FindingsReviewDevSandbox.scss";

const DEV_ACCESS_TOKEN = "dev-access-token";
const DEV_HISTORY_ID = "findings-review-dev";

const QUEUE_SECOND_TYPE: FindingModuleType = "HRVD";

type SubmitScenario = "success" | "api_error" | "null_result";
type QueueMode = "empty" | "one_more";

const supportedFindingTypes = (
  Object.keys(FINDING_MODULES) as FindingModuleType[]
).filter((type) => type in findingExamples);

const isFindingModuleType = (value: string): value is FindingModuleType =>
  supportedFindingTypes.includes(value as FindingModuleType);

const getFixtureFinding = (type: FindingModuleType): Finding =>
  findingExamples[type as keyof typeof findingExamples] as Finding;

const buildFindingsState = (
  activeFinding: Finding,
  queueMode: QueueMode
): FindingsStateResponse => {
  const secondFinding = getFixtureFinding(QUEUE_SECOND_TYPE);
  const orderedIds =
    queueMode === "one_more"
      ? [activeFinding.id, secondFinding.id]
      : [activeFinding.id];

  const findingsCurrent =
    queueMode === "one_more" ? [activeFinding, secondFinding] : [activeFinding];

  return {
    findings_current: findingsCurrent,
    review_queue: { ordered_ids: orderedIds },
  };
};

const FindingsReviewDevSandbox = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType = useMemo(() => {
    const fromQuery = searchParams.get("type");
    if (fromQuery && isFindingModuleType(fromQuery)) {
      return fromQuery;
    }
    return supportedFindingTypes[0] ?? "OVERCHARGE_PREHSTPA";
  }, [searchParams]);

  const [findingType, setFindingType] =
    useState<FindingModuleType>(initialType);
  const [activeFindingId, setActiveFindingId] = useState<string>(
    () => getFixtureFinding(initialType).id
  );
  const [submitScenario, setSubmitScenario] =
    useState<SubmitScenario>("success");
  const [resultKind, setResultKind] = useState<RhFindingResult>("no_violation");
  const [queueMode, setQueueMode] = useState<QueueMode>("empty");

  const activeFinding = useMemo(() => {
    const fromState = buildFindingsState(
      getFixtureFinding(findingType),
      queueMode
    ).findings_current.find((f) => f.id === activeFindingId);
    return fromState ?? getFixtureFinding(findingType);
  }, [findingType, queueMode, activeFindingId]);

  const module = FINDING_MODULES[activeFinding.type as FindingModuleType];

  const findingsState = useMemo(
    () => buildFindingsState(activeFinding, queueMode),
    [activeFinding, queueMode]
  );

  const { substepIndex, substepCount } =
    getFindingsReviewSubsteps(findingsState);

  useEffect(() => {
    queryClient.setQueryData(
      accountQueryKeys.findingsState(DEV_HISTORY_ID),
      findingsState
    );
  }, [queryClient, findingsState]);

  useEffect(() => {
    const fromQuery = searchParams.get("type");
    if (
      fromQuery &&
      isFindingModuleType(fromQuery) &&
      fromQuery !== findingType
    ) {
      setFindingType(fromQuery);
      setActiveFindingId(getFixtureFinding(fromQuery).id);
    }
  }, [searchParams, findingType]);

  const handleTypeChange = (nextType: FindingModuleType) => {
    setFindingType(nextType);
    setActiveFindingId(getFixtureFinding(nextType).id);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("type", nextType);
        return next;
      },
      { replace: true }
    );
  };

  const devValidateMutate: DevValidateMutate = useCallback(
    (_variables, options) => {
      if (submitScenario === "api_error") {
        options?.onError?.(
          new AccountApiError(400, {
            error: "Invalid answers for this finding (dev mock).",
            error_code: "validation_error",
          })
        );
        return;
      }

      const validatedFinding: Finding = {
        ...activeFinding,
        status: "validated",
        validated_at: new Date().toISOString(),
        result: submitScenario === "null_result" ? null : resultKind,
      };

      const nextQueueIds =
        queueMode === "one_more" && activeFinding.id !== QUEUE_SECOND_TYPE
          ? [getFixtureFinding(QUEUE_SECOND_TYPE).id]
          : [];

      queryClient.setQueryData<FindingsStateResponse>(
        accountQueryKeys.findingsState(DEV_HISTORY_ID),
        (previous) => ({
          findings_current: previous
            ? previous.findings_current.map((item) =>
                item.id === validatedFinding.id ? validatedFinding : item
              )
            : [validatedFinding],
          review_queue: { ordered_ids: nextQueueIds },
        })
      );

      options?.onSuccess?.({
        finding: validatedFinding,
        queue_delta: {
          ordered_ids: nextQueueIds,
          added: [],
          removed: [activeFinding.id],
        },
      });
    },
    [activeFinding, queryClient, queueMode, resultKind, submitScenario]
  );

  if (!module) {
    return <p>Unsupported finding type in sandbox: {activeFinding.type}</p>;
  }

  return (
    <div className="findings-review-dev-sandbox">
      <aside
        className="findings-review-dev-sandbox__toolbar"
        aria-label="Findings review dev controls"
      >
        <p className="findings-review-dev-sandbox__notice">
          Development preview — mock data and submit stub (see{" "}
          <code>FindingsReview/dev/README.md</code>).
        </p>
        <label className="findings-review-dev-sandbox__field">
          Finding type
          <select
            value={findingType}
            onChange={(event) =>
              handleTypeChange(event.target.value as FindingModuleType)
            }
          >
            {supportedFindingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="findings-review-dev-sandbox__field">
          Submit scenario
          <select
            value={submitScenario}
            onChange={(event) =>
              setSubmitScenario(event.target.value as SubmitScenario)
            }
          >
            <option value="success">Success (result modal)</option>
            <option value="api_error">API error (submit alert)</option>
            <option value="null_result">Null result (submit alert)</option>
          </select>
        </label>
        {submitScenario === "success" ? (
          <label className="findings-review-dev-sandbox__field">
            Result kind
            <select
              value={resultKind}
              onChange={(event) =>
                setResultKind(event.target.value as RhFindingResult)
              }
            >
              <option value="no_violation">no_violation</option>
              <option value="potential_violation">potential_violation</option>
              <option value="dismissed">dismissed</option>
            </select>
          </label>
        ) : null}
        <label className="findings-review-dev-sandbox__field">
          Queue after submit
          <select
            value={queueMode}
            onChange={(event) => setQueueMode(event.target.value as QueueMode)}
          >
            <option value="empty">Empty (View report)</option>
            <option value="one_more">One more ({QUEUE_SECOND_TYPE})</option>
          </select>
        </label>
      </aside>

      <main className="findings-review-page">
        <div className="findings-review-body">
          <AnalysisFlowProgress
            stepId="findings-review"
            substepIndex={substepIndex}
            substepCount={substepCount}
          />
          <FindingReviewFlow
            key={activeFinding.id}
            module={module}
            finding={activeFinding}
            accessToken={DEV_ACCESS_TOKEN}
            historyId={DEV_HISTORY_ID}
            onAdvanceToFinding={setActiveFindingId}
            devValidateMutate={devValidateMutate}
          />
        </div>
      </main>
    </div>
  );
};

export default FindingsReviewDevSandbox;
