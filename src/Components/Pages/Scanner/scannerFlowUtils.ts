import type { NavigateFunction } from "react-router-dom";

import { isAccountApiError } from "../../../api/account";
import { getRhAuthSession } from "../../../session/rhSessionStorage";
import { clearScannerStepState } from "../ScanReviewPage/scanReviewState";

export type RhScanContext = {
  token: string;
  historyId: string;
};

export const requireRhScanContext = (
  historyId: string | null
): RhScanContext | null => {
  const token = getRhAuthSession()?.accessToken;
  if (!token || !historyId) {
    return null;
  }
  return { token, historyId };
};

export const flowErrorFromApi = (
  error: unknown,
  fallbackMessage: string
): string => (isAccountApiError(error) ? error.message : fallbackMessage);

export type NavigateToPreScanOptions = {
  replace?: boolean;
};

export const navigateToPreScan = (
  navigate: NavigateFunction,
  locale: string,
  { replace = true }: NavigateToPreScanOptions = {}
): void => {
  clearScannerStepState();
  navigate(`/${locale}/scanner`, { replace });
};
