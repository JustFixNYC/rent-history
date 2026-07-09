import { isAccountApiError } from "../../../api/account";
import { getRhAuthSession } from "../../../session/rhSessionStorage";

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

export const clearStoredPageImageUrls = (
  urls: Record<string, string>,
  revoke: (urls: Record<string, string>) => void,
  setUrls: (urls: Record<string, string>) => void
): void => {
  revoke(urls);
  setUrls({});
};
