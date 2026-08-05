import { useCallback, useState } from "react";

export type OcrConfirmPhase = "initial" | "confirmed";

export type UseOcrConfirmStateResult = {
  phase: OcrConfirmPhase;
  isConfirmed: boolean;
  confirm: () => void;
  edit: () => void;
};

export function useOcrConfirmState(
  initialPhase: OcrConfirmPhase = "initial"
): UseOcrConfirmStateResult {
  const [phase, setPhase] = useState<OcrConfirmPhase>(initialPhase);

  const confirm = useCallback(() => {
    setPhase("confirmed");
  }, []);

  const edit = useCallback(() => {
    setPhase("initial");
  }, []);

  return {
    phase,
    isConfirmed: phase === "confirmed",
    confirm,
    edit,
  };
}
