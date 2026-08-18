# ScanReviewPage

Error and recovery review at `/:locale/scan-review`. Users land here when the compiling poll returns `needs_rescan`, when session restore finds in-progress pages, or when capture from scan-review fails and routes back with failure state.

**Prerequisites:** OTP login session (`rhSessionStorage`) and an active rent-history record (`historyId`).

---

## Route responsibilities

`ScanReviewPage.tsx` orchestrates review UI and recovery actions. It does **not** initialize Dynamsoft — capture is delegated to `/scanner` via `ScannerCaptureIntent` location state.

```
needs_rescan (compiling poll) ──► /scan-review
session restore (saved scan-review) ──► /scan-review
capture failure from /scanner ──► /scan-review (launch/upload failure state)

/scan-review ──Next──► finalize-scan ──► /compiling
           ──add/rescan/restart──► /scanner (captureIntent) ──Done──► finalize-scan ──► /compiling
           ──bootstrap failure──► /scanner (no restorable pages)
```

`AnalysisFlowProgress` uses `stepId="scan-review"` (after compiling in the analysis flow).

---

## Review pipeline

1. **Bootstrap** — `useScanReviewBootstrapRestore` reads session step state (scoped to active `historyId`), checks scan-pipeline status, and/or fetches restorable pages from the backend. Redirects to `/scanner` when nothing to restore.
2. **Poll** — `useScanReview` polls `GET …/scan-review` until ready or accept-partial timeout.
3. **Thumbnails** — presigned download URLs via `useScanReviewPageImages`.
4. **Finalize** — `POST /rh/history/finalize-scan` on **Next**, then navigate to `/{locale}/compiling`.
5. **Capture handoff** — rescan, add-more, and restart navigate to `/scanner` with `ScannerCaptureIntent` in location state; successful capture returns here or goes to `/compiling`.

---

## Module contents

| File / folder                            | Role                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `ScanReviewPage.tsx`                     | Orchestration: bootstrap, finalize, restart/rescan/add-more handlers   |
| `ScanReviewScreen.tsx`                   | Review layout, carousel, action buttons                                |
| `ScanReviewCallouts.tsx`                 | Year-gap, processing, upload/launch failure, pipeline failure callouts |
| `ScanReviewRetakeGroup.tsx`              | Pages flagged `needs_retake`                                           |
| `scanReviewState.ts`                     | Session persistence for `scan-review` phase + `expectedPageCount`      |
| `scanReviewUtils.ts`                     | `isScanReviewClean` — no missing years and no retakes                  |
| `hooks/useScanReviewBootstrapRestore.ts` | Restore on load; pipeline redirect; bootstrap fetch                    |
| `hooks/useScanReviewBootstrap.ts`        | One-shot bootstrap fetch helper                                        |
| `hooks/useScanReview.ts`                 | Poll scan-review until ready or partial timeout                        |
| `hooks/useScanReviewPageImages.ts`       | Presigned URLs for review thumbnails                                   |

Shared with Scanner: `scannerLocationState.ts` (capture intent types), `scannerFlowUtils.ts` (auth guard, error mapping).

---

## Session persistence

`scanReviewState.ts` (key `"scanner"`) stores:

```ts
{ historyId: string, phase: "scan-review", expectedPageCount: number }
```

Written when entering scan-review from `needs_rescan`, launch failure during rescan, or explicit bootstrap. Cleared on successful finalize, restart, or when bootstrap finds no pages.

`expectedPageCount` tracks client upload count; the scan-review poll uses it so the backend knows how many S3 objects to wait for.

---

## Review behavior

- **`missing_year_ranges`** — gaps detected by OCR; **Next** stays disabled until filled.
- **`processing_complete`** — when false, shows a warning callout; does not block **Next**.
- **Pipeline failures** — from compiling poll `early_validation.failures` via router state.
- **Upload / launch failures** — surfaced as info callouts from location state after failed capture.
- **`needs_retake`** — poor-quality pages in `ScanReviewRetakeGroup`; re-scan deletes those records server-side, then navigates to `/scanner` with rescan intent.
- **Restart** — confirms via `ConfirmModal`, deletes all scanned pages, navigates to `/scanner` with restart intent.

---

## Tests

| File                                    | Coverage                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `ScanReviewPage.test.tsx`               | Finalize, callouts, bootstrap restore, rescan/restart, launch/upload failure UI |
| `hooks/useScanReviewBootstrap.test.tsx` | Bootstrap fetch behavior                                                        |
| `hooks/useScanReview.test.tsx`          | Poll and accept-partial timeout                                                 |

Route registration: `src/App.tsx` (`path="scan-review"`). Route protection: `App.route-protection.test.tsx`.
