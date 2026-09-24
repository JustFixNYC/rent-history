import type { RhPageSummary } from "../../../../api/account/types";
import { usePresignedPageImageUrls } from "../../../../hooks/usePresignedPageImageUrls";

import type { ScannerPhase } from "../scannerTypes";

export type UseScanReviewPageImagesParams = {
  readyPages: RhPageSummary[] | undefined;
  phase: ScannerPhase;
  onError?: (message: string) => void;
};

export const useScanReviewPageImages = ({
  readyPages,
  phase,
  onError,
}: UseScanReviewPageImagesParams) => {
  const keys = readyPages?.map((page) => page.s3_key) ?? [];

  return usePresignedPageImageUrls({
    s3Keys: keys,
    enabled: phase === "scan-review" && keys.length > 0,
    onError,
  });
};
