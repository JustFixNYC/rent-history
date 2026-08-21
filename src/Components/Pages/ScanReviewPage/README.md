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

1. **Bootstrap** — `useScanReviewBootstrapRestore` reads session step state (scoped to active `historyId`), checks scan-pipeline status, and/or fetches restorable pages from the backend. Redirects to `/scanner` when nothing to restore. Pipeline fetch failure blocks scan-review restore until **Try again** succeeds (error callout; no review UI flash).
2. **Poll** — `useScanReview` polls `GET …/scan-review` until ready or accept-partial timeout.
3. **Thumbnails** — presigned download URLs via `useScanReviewPageImages`.
4. **Finalize** — `POST /rh/history/finalize-scan` on **Next**, then navigate to `/{locale}/compiling`.
5. **Capture handoff** — rescan, add-more, and restart navigate to `/scanner` with `ScannerCaptureIntent` in location state; successful capture returns here or goes to `/compiling`.

---

## Module contents

| File / folder                            | Role                                                               |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `ScanReviewPage.tsx`                     | Orchestration: bootstrap, entry-screen routing, rescan handlers    |
| `ScanReviewFlow.tsx`                     | `incrementalFlow` entry — year step, confirm API, mismatch callout |
| `ScanReviewModuleStack.tsx`              | Progressive module stack (findings pattern)                        |
| `ScanReviewLastRegYearStep.tsx`          | Step 1 year dropdown (`scanned_max_reg_year`…current year)         |
| `ScanReviewRegYearErrorCallout.tsx`      | Orange reg_year range callout + incremental rescan CTA             |
| `scanReviewModes.ts`                     | Semantic mode constants + mode reference table                     |
| `scanReviewScreenState.ts`               | Entry-screen resolver (`resolveScanReviewScreen`) + label helpers  |
| `ScanReviewErrorScreen.tsx`              | `partialPageErrors` — Page N callout + partial rescan CTA          |
| `ScanReviewTotalFailureScreen.tsx`       | `totalFailure` — re-scan all + DHCR request link                   |
| `ScanReviewPageErrorCallout.tsx`         | Orange Page N / Page N of M callout (`partialPageErrors` only)     |
| `scanReviewState.ts`                     | Session persistence for `scan-review` phase + `expectedPageCount`  |
| `hooks/useScanReviewBootstrapRestore.ts` | Restore on load; pipeline redirect; bootstrap fetch                |

Shared with Scanner: `scannerLocationState.ts` (capture intent types), `scannerFlowUtils.ts` (auth guard, error mapping).

`ScanReviewFlow` handles `incrementalFlow` entry (`warningOnly`, `errorsAndWarning`) and flow-local `warningYearMismatch` after Continue.

---

## Mode vocabulary

Page-level routing uses **entry screens** from `scanReviewModes.ts`. See `SCAN_REVIEW_MODE_REFERENCE` for semantic mode conditions.

| Semantic mode         | Entry vs flow                                      | Entry screen        |
| --------------------- | -------------------------------------------------- | ------------------- |
| `warningOnly`         | Entry                                              | `incrementalFlow`   |
| `warningYearMismatch` | **Flow phase** (post-Continue in `ScanReviewFlow`) | —                   |
| `errorsAndWarning`    | Entry                                              | `incrementalFlow`   |
| `partialPageErrors`   | Entry                                              | `partialPageErrors` |
| `totalFailure`        | Entry                                              | `totalFailure`      |

`resolveScanReviewScreen` returns `incrementalFlow`, `partialPageErrors`, or `totalFailure` only. Incremental entry states include `flowMode: warningOnly | errorsAndWarning` for Task 6.

---

## Rescan CTA matrix

| Semantic mode                      | Entry screen        | Server action before pre-scan                 | Pre-scan `expectedPageCount` |
| ---------------------------------- | ------------------- | --------------------------------------------- | ---------------------------- |
| `partialPageErrors`                | `partialPageErrors` | Delete flagged page IDs (`DELETE …/pages`)    | Current count − deleted IDs  |
| `totalFailure`                     | `totalFailure`      | Delete all pages (`DELETE …/pages/all`)       | `0`                          |
| `warningOnly` / `errorsAndWarning` | `incrementalFlow`   | No delete — navigate to pre-scan to add pages | Current `expectedPageCount`  |
| `warningYearMismatch`              | (flow-local)        | No delete — navigate to pre-scan to add pages | Current `expectedPageCount`  |

Non-pipeline entry paths (`showLaunchFailure`, upload failures, etc.) route to `totalFailure` and use the total-failure rescan handler.

---

## Tests

| File                                           | Coverage                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `ScanReviewPage.test.tsx`                      | Partial/total/incremental failure rendering, rescan CTAs, bootstrap restore |
| `ScanReviewFlow.test.tsx`                      | Year step, confirm match/mismatch, merged reg_year callout                  |
| `scanReviewScreenState.test.ts`                | Entry-screen resolution, Page N label formatting                            |
| `hooks/useScanReviewBootstrapRestore.test.tsx` | Pipeline gate, redirect, error blocking, retry                              |

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

| File                                           | Coverage                                                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ScanReviewPage.test.tsx`                      | Finalize, callouts, bootstrap restore, rescan/restart, launch/upload failure UI, pipeline bootstrap error |
| `hooks/useScanReviewBootstrapRestore.test.tsx` | Pipeline gate, redirect, error blocking, retry                                                            |
| `hooks/useScanReviewBootstrap.test.tsx`        | Bootstrap fetch behavior                                                                                  |
| `hooks/useScanReview.test.tsx`                 | Poll and accept-partial timeout                                                                           |

Route registration: `src/App.tsx` (`path="scan-review"`). Route protection: `App.route-protection.test.tsx`.
