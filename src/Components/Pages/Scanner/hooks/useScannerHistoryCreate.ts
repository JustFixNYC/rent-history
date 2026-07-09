import { useEffect, useRef, useState } from "react";
import { useLingui } from "@lingui/react";
import { msg } from "@lingui/core/macro";
import { useCreateRhHistory } from "../../../../api/account";
import {
  getRhAuthSession,
  getRhHistoryId,
  setRhHistoryId,
} from "../../../../session/rhSessionStorage";
import { flowErrorFromApi } from "../scannerFlowUtils";

export type HistoryCreatePhase = "idle" | "creating" | "ready" | "error";

export type UseScannerHistoryCreateResult = {
  historyId: string | null;
  historyCreatePhase: HistoryCreatePhase;
  historyCreateError: string | null;
};

export function useScannerHistoryCreate(): UseScannerHistoryCreateResult {
  const { _ } = useLingui();
  const [historyId, setHistoryIdState] = useState<string | null>(() =>
    getRhHistoryId()
  );
  const [historyCreatePhase, setHistoryCreatePhase] =
    useState<HistoryCreatePhase>(() => (getRhHistoryId() ? "ready" : "idle"));
  const [historyCreateError, setHistoryCreateError] = useState<string | null>(
    null
  );
  const historyEnsurePromiseRef = useRef<Promise<void> | null>(null);
  const createRhHistoryMutation = useCreateRhHistory();

  useEffect(() => {
    if (historyId) return;

    const otpSession = getRhAuthSession();
    if (!otpSession) {
      setHistoryCreatePhase("error");
      setHistoryCreateError(
        _(
          msg`Your session is missing login data. Go back to login and try again.`
        )
      );
      return;
    }

    if (historyEnsurePromiseRef.current) return;

    let cancelled = false;
    setHistoryCreatePhase("creating");
    setHistoryCreateError(null);

    const ensureHistory = async () => {
      try {
        const history = await createRhHistoryMutation.mutateAsync(
          otpSession.accessToken
        );
        setRhHistoryId(history.id);
        setHistoryIdState(history.id);
        setHistoryCreatePhase("ready");
      } catch (error) {
        if (cancelled) return;
        setHistoryCreatePhase("error");
        setHistoryCreateError(
          flowErrorFromApi(
            error,
            _(msg`Unable to create your rent history record. Please try again.`)
          )
        );
      }
    };

    historyEnsurePromiseRef.current = ensureHistory().finally(() => {
      historyEnsurePromiseRef.current = null;
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyId]);

  return { historyId, historyCreatePhase, historyCreateError };
}
