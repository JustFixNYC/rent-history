import { useCallback, useEffect, useState } from "react";

import { downloadScans } from "../api/presignedS3";
import { useRhSession } from "../session/RhSessionContext";

export type RhScanBlobItem = { key: string; blob: Blob };

export type RhSessionScanBlobsState =
  | { status: "empty" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; items: RhScanBlobItem[] };

export function useRhSessionScanBlobs(): {
  state: RhSessionScanBlobsState;
  retry: () => void;
} {
  const { document } = useRhSession();
  const keys = document.flow.pages.map((p) => p.s3_key);
  const keysFingerprint = keys.join("\0");

  const [retryCount, setRetryCount] = useState(0);
  const [state, setState] = useState<RhSessionScanBlobsState>({
    status: "loading",
  });

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (keys.length === 0) {
        if (!cancelled) setState({ status: "empty" });
        return;
      }

      if (!cancelled) setState({ status: "loading" });

      try {
        const results = await downloadScans(keys);
        const items: RhScanBlobItem[] = [];
        for (const { key, response } of results) {
          if (!response.ok) {
            throw new Error(
              `Download failed for ${key} (HTTP ${response.status}).`
            );
          }
          items.push({ key, blob: await response.blob() });
        }
        if (!cancelled) setState({ status: "success", items });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load scan images.";
        if (!cancelled) setState({ status: "error", message });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [keys, keysFingerprint, retryCount]);

  return { state, retry };
}
