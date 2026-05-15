/**
 * Converts `RhPage.scan_url` from the RH API into an S3 object key accepted by
 * `downloadScans` / the presign service (`profile_id/history_id/filename.jpg`).
 *
 * Production URLs are built by rh-extract as virtual-hosted style:
 * `https://{bucket}.s3.amazonaws.com/{image_key}` (see rh_history_page.py).
 *
 * NOTE: This is temporary. Later we'll use uuid for scan file name and set that
 * as RhPage.pk so full s3 key as `{profile_id}/{history_id}/{page_id}.jpg`
 */

const PRESIGN_KEY_PATTERN = /^\d+\/[^/]+\/[^/]+$/;

export class ScanUrlToKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanUrlToKeyError";
  }
}

export const scanUrlToPresignKey = (scanUrl: string): string => {
  let url: URL;
  try {
    url = new URL(scanUrl);
  } catch {
    throw new ScanUrlToKeyError(`Invalid scan URL: ${scanUrl}`);
  }

  const path = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  if (!PRESIGN_KEY_PATTERN.test(path)) {
    throw new ScanUrlToKeyError(
      `Scan URL path is not a valid presign key (expected digits/uuid-or-id/filename): ${path}`
    );
  }
  return path;
};
