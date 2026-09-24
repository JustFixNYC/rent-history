import { useCallback, useEffect, useRef, useState } from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

import { downloadScans } from "../api/account/scanPresign";

import { clearPageImageUrls, revokePageImageUrls } from "./pageImageUrlUtils";

export type UsePresignedPageImageUrlsParams = {
  s3Keys: string[];
  enabled?: boolean;
  onError?: (message: string) => void;
};

export type UsePresignedPageImageUrlsResult = {
  urlsByKey: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
  clear: () => void;
};

export const usePresignedPageImageUrls = ({
  s3Keys,
  enabled = true,
  onError,
}: UsePresignedPageImageUrlsParams): UsePresignedPageImageUrlsResult => {
  const { _ } = useLingui();
  const [urlsByKey, setUrlsByKey] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const urlsByKeyRef = useRef(urlsByKey);
  urlsByKeyRef.current = urlsByKey;

  const keysFingerprint = s3Keys.join("\0");
  const shouldLoad = enabled && s3Keys.length > 0;

  const clear = useCallback(() => {
    clearPageImageUrls(urlsByKeyRef.current, setUrlsByKey);
    setError(null);
    setIsLoading(false);
  }, []);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    let cancelled = false;

    const loadPageImages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await downloadScans(s3Keys);
        const nextUrls: Record<string, string> = {};

        for (const { key, response } of results) {
          if (!response.ok) {
            throw new Error(
              `Download failed for ${key} (HTTP ${response.status}).`
            );
          }
          nextUrls[key] = URL.createObjectURL(await response.blob());
        }

        if (cancelled) {
          revokePageImageUrls(nextUrls);
          return;
        }

        setUrlsByKey((current) => {
          revokePageImageUrls(current);
          return nextUrls;
        });
      } catch (loadError) {
        if (cancelled) return;
        const message =
          loadError instanceof Error
            ? loadError.message
            : _(msg`Unable to load scan previews.`);
        setError(message);
        onError?.(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPageImages();

    return () => {
      cancelled = true;
    };
    // keysFingerprint tracks s3Keys content without unstable array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- s3Keys read when fingerprint changes
  }, [_, keysFingerprint, onError, retryCount, shouldLoad]);

  useEffect(
    () => () => {
      revokePageImageUrls(urlsByKeyRef.current);
    },
    []
  );

  return {
    urlsByKey,
    isLoading: shouldLoad && isLoading,
    error,
    retry,
    clear,
  };
};
