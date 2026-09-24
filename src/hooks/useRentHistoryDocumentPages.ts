import { useMemo } from "react";

import { useHistoryAnalysisPages } from "../api/account";
import { getRhAuthSession } from "../session/rhSessionStorage";
import { useRhSession } from "../session/RhSessionContext";

import {
  mapPagesWithImageUrls,
  type RentHistoryPageCardData,
} from "../Components/RentHistoryPageCard/pageCardUtils";
import { usePresignedPageImageUrls } from "./usePresignedPageImageUrls";
import { sessionPagesMatchHistory } from "../utils/rhScanKeyPrefix";

export type UseRentHistoryDocumentPagesParams = {
  enabled?: boolean;
};

export type UseRentHistoryDocumentPagesResult = {
  pages: RentHistoryPageCardData[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

export const useRentHistoryDocumentPages = ({
  enabled = false,
}: UseRentHistoryDocumentPagesParams): UseRentHistoryDocumentPagesResult => {
  const { document } = useRhSession();
  const accessToken = getRhAuthSession()?.accessToken;
  const historyId = document.flow.historyId ?? undefined;
  const sessionPages = document.flow.pages;

  const trustedSessionPages = useMemo(
    () =>
      historyId && sessionPagesMatchHistory(sessionPages, historyId)
        ? sessionPages
        : [],
    [historyId, sessionPages]
  );

  const {
    data: fetchedPages,
    isLoading: isMetadataLoading,
    isError: isMetadataError,
    error: metadataError,
    refetch: refetchMetadata,
  } = useHistoryAnalysisPages({
    accessToken,
    historyId,
    enabled: enabled && trustedSessionPages.length === 0,
  });

  const metadataPages = useMemo(
    () =>
      trustedSessionPages.length > 0 ? trustedSessionPages : fetchedPages ?? [],
    [fetchedPages, trustedSessionPages]
  );

  const s3Keys = useMemo(
    () => metadataPages.map((page) => page.s3_key),
    [metadataPages]
  );

  const {
    urlsByKey,
    isLoading: areImagesLoading,
    error: imageError,
    retry: retryImages,
  } = usePresignedPageImageUrls({
    s3Keys,
    enabled: enabled && s3Keys.length > 0,
  });

  const pages = useMemo(
    () => mapPagesWithImageUrls(metadataPages, urlsByKey),
    [metadataPages, urlsByKey]
  );

  const retry = () => {
    if (trustedSessionPages.length === 0) {
      void refetchMetadata();
    }
    retryImages();
  };

  const metadataErrorMessage =
    isMetadataError && metadataError instanceof Error
      ? metadataError.message
      : isMetadataError
      ? "Unable to load rent history pages."
      : null;

  return {
    pages,
    isLoading: isMetadataLoading || areImagesLoading,
    error: metadataErrorMessage ?? imageError,
    retry,
  };
};
