import type { RhPageSummary } from "../../../../api/account/types";
import { usePresignedPageImageUrls } from "../../../../hooks/usePresignedPageImageUrls";

export type UseScanReviewPageImagesParams = {
  readyPages: RhPageSummary[] | undefined;
  enabled?: boolean;
  onError?: (message: string) => void;
};

export const useScanReviewPageImages = ({
  readyPages,
  enabled = true,
  onError,
}: UseScanReviewPageImagesParams) => {
  const keys = readyPages?.map((page) => page.s3_key) ?? [];

  return usePresignedPageImageUrls({
    s3Keys: keys,
    enabled: enabled && keys.length > 0,
    onError,
  });
};
