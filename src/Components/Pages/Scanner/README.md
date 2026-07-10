# Scanner

Rent-history document scanning flow at `/:locale/scanner`. Users photograph each page of their rent history with the device camera, review OCR results, then continue to address confirmation.

**Prerequisites:** OTP login session (`rhSessionStorage`) and a rent-history record (`historyId`, created on mount if missing).

---

## Phase flow

`Scanner.tsx` is the orchestrator. It renders one screen per `ScannerPhase`:

| Phase           | Screen                                                               | Persisted?     |
| --------------- | -------------------------------------------------------------------- | -------------- |
| `pre-scan`      | `PreScanScreen` — tips + “Start scanning”                            | Yes (default)  |
| `camera-access` | `CameraAccessScreen` — permission instructions                       | No (transient) |
| `scanning`      | Dynamsoft UI + `ScannerInProgressScreen` + optional `ScannerOverlay` | No (transient) |
| `scan-review`   | `ScanReviewScreen` — page cards, retake groups, year-gap callouts    | Yes            |

```
pre-scan ──Start──► scanning ──Done──► scan-review ──Next──► /confirm-address
    ▲                    │                    │
    │                    │ denied             ├── Add more ──► scanning
    └── camera-access ◄──┘                    ├── Re-scan pages ──► scanning
                                              └── Restart ──► scanning (clears all)
```

On return visits, `useScannerBootstrapRestore` reads persisted step state (scoped to active `historyId`) and/or asks the backend whether in-progress pages exist, then lands on `pre-scan` or `scan-review`.

---

## Scan capture pipeline

1. **Dynamsoft** — `DocumentScanner` (continuous scanning, auto-crop, frame verification). Configured in `Scanner.tsx` on mount; disposed on unmount.
2. **`onDocumentScanned`** — corrected JPEG blob uploaded via presigned S3 URL (`uploadScan` in `api/account/scanPresign.ts`). Key shape: `{profileId}/{historyId}/{uuid}.jpg`.
3. **Backend processing** — S3 upload triggers server-side OCR/page assembly. Frontend polls `GET …/scan-review` until status is `ready` or times out with partial results (`useScanReview`).
4. **Review UI** — presigned download URLs for thumbnails (`useScanReviewPageImages` → `usePresignedPageImageUrls`).

Dynamsoft renders inside shadow DOM. `scanner-overlay.ts` walks that tree to probe live-view visibility, patch the “Done (n)” button label for i18n, and detect camera-permission errors.

---

## Module contents

| File / folder                         | Role                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `Scanner.tsx`                         | Phase state, Dynamsoft lifecycle, handlers (start, restart, rescan, add more, next) |
| `PreScanScreen.tsx`                   | Pre-scan copy and tips                                                              |
| `CameraAccessScreen.tsx`              | Camera permission recovery                                                          |
| `ScannerInProgressScreen.tsx`         | Loading shell while Dynamsoft is active                                             |
| `ScanReviewScreen.tsx`                | Review layout; delegates callouts and retake group                                  |
| `ScanReviewCallouts.tsx`              | Year-gap, processing, upload/launch failure, add-more, and rescan-success callouts  |
| `ScanReviewRetakeGroup.tsx`           | Pages flagged `needs_retake`                                                        |
| `ScannerOverlay.tsx`                  | US-letter aspect-ratio guide portal over Dynamsoft live view                        |
| `scannerState.ts`                     | Session persistence for `scan-review` + `expectedPageCount`, bound to `historyId`   |
| `scannerTypes.ts`                     | `ScannerPhase` union type                                                           |
| `scannerFlowUtils.ts`                 | Auth/history guard + API error mapping                                              |
| `scanner-overlay.ts`                  | Dynamsoft DOM helpers (visibility, labels, camera probe)                            |
| `scanReviewUtils.ts`                  | `isScanReviewClean` — no missing years and no retakes                               |
| `hooks/useScannerHistoryCreate.ts`    | Ensures `historyId` exists via `POST` create                                        |
| `hooks/useScannerBootstrapRestore.ts` | Restore phase on load                                                               |
| `hooks/useScanReviewPageImages.ts`    | Presigned URLs for review thumbnails                                                |
| `hooks/useScanReview.ts`              | Poll `scan-review` until ready or partial timeout                                   |
| `hooks/useScanReviewBootstrap.ts`     | One-shot bootstrap fetch on load (restore scan-review)                              |

Post-combine analysis pages (`useHistoryAnalysisPages`) live in `src/api/account/hooks/analysisPages.ts` and are consumed by `src/hooks/useRentHistoryDocumentPages.ts` (document viewer modal).

---

## Session persistence

Only **`scan-review`** is written to session storage (`scannerState.ts`, key `"scanner"`):

```ts
{ historyId: string, phase: "scan-review", expectedPageCount: number }
```

`readScannerStepState()` returns `null` when stored `historyId` does not match the active session (e.g. after switching rent histories). `expectedPageCount` tracks how many pages the client uploaded this session; the scan-review query uses it so the backend knows how many S3 objects to wait for.

Transient phases (`scanning`, `camera-access`) are not persisted. On unmount during an active scan, if pages were captured, state is flushed to `scan-review` so a refresh can resume review.

`clearScannerStepState()` runs when restarting, re-scanning selected pages, or bootstrap finds no pages.

---

## Scan review behavior

- **`missing_year_ranges`** — gaps detected by OCR; **Next** stays disabled until filled (user adds pages or rescans).
- **`processing_complete`** — when false, shows a warning callout; does not block **Next**.
- **Upload / launch failures** — surfaced as info callouts after a scan session; user can re-scan missing pages.
- **`needs_retake`** — poor-quality pages grouped in `ScanReviewRetakeGroup`; re-scan deletes those page records server-side, then relaunches Dynamsoft.
- **Restart** — confirms via `ConfirmModal`, deletes all scanned pages, resets count, relaunches scanner.
- **Next** — `combineRhHistoryPages`, fetches analysis pages into React Query + session, navigates to `confirm-address`.

---

## External dependencies

| Dependency                   | Usage                                       |
| ---------------------------- | ------------------------------------------- |
| `dynamsoft-document-scanner` | Camera capture UI                           |
| `@tanstack/react-query`      | Scan-review polling and analysis-page cache |
| `@lingui/*`                  | Copy and Dynamsoft button labels            |
| `VITE_DYNAMSOFT_LICENSE_KEY` | Dynamsoft license (env)                     |

---

## Tests

| File                                    | Coverage                                    |
| --------------------------------------- | ------------------------------------------- |
| `Scanner.test.tsx`                      | Phase rendering, start/restart/rescan flows |
| `scannerState.test.ts`                  | Session read/write/clear                    |
| `scannerFlowUtils.test.ts`              | Context guard, error mapping                |
| `scanner-overlay.test.ts`               | DOM visibility helpers, label patching      |
| `hooks/useScanReviewBootstrap.test.tsx` | Bootstrap fetch behavior                    |
| `hooks/useScanReview.test.tsx`          | Poll and accept-partial timeout behavior    |

Route registration: `src/App.tsx` (`path="scanner"`). Route protection: `App.route-protection.test.tsx`.
