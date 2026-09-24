# ScanReviewPage

Error and recovery review at `/:locale/scan-review`. Users land here when the compiling poll returns `needs_rescan`, when session restore finds in-progress pages, or when capture from scan-review fails and routes back with failure state.

**Prerequisites:** OTP login session (`rhSessionStorage`) and an active rent-history record (`historyId`).

---

## Route responsibilities

`ScanReviewPage.tsx` is a thin orchestrator: bootstrap restore, `resolveScanReviewScreen`, and a `switch` that renders the matching entry screen. It does **not** initialize Dynamsoft — capture is delegated to `/scanner` via `navigateToPreScan`.

```
needs_rescan (compiling poll) ──► /scan-review
session restore (saved scan-review) ──► /scan-review
capture failure from /scanner ──► /scan-review (launch/upload failure state)

/scan-review ──Next──► finalize-scan ──► /compiling
           ──rescan/restart──► /scanner (pre-scan) ──Done──► finalize-scan ──► /compiling
           ──bootstrap failure──► /scanner (no restorable pages)
```

`AnalysisFlowProgress` uses `stepId="compiling"` (compiling step in the analysis flow).

---

## Review pipeline

1. **Bootstrap** — `useScanReviewBootstrapRestore` reads session step state (scoped to active `historyId`), checks scan-pipeline status, and/or fetches restorable pages from the backend. Redirects to `/scanner` when nothing to restore. Pipeline fetch failure blocks scan-review restore until **Try again** succeeds (error callout; no review UI flash).
2. **Poll** — `useScanReview` polls `GET …/scan-review` until ready or accept-partial timeout.
3. **Thumbnails** — presigned download URLs via `useScanReviewPageImages`.
4. **Finalize** — `POST /rh/history/finalize-scan` on **Next**, then navigate to `/{locale}/compiling`.
5. **Capture handoff** — all rescan CTAs call `navigateToPreScan` (clears step state, navigates to `/${locale}/scanner`). Successful capture returns here or goes to `/compiling`. Server dedupes on re-finalize; **no delete API calls**.

---

## Module contents

| File / folder                                       | Role                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `ScanReviewPage.tsx`                                | Orchestration: bootstrap, resolver switch, rescan/navigation handlers |
| `ScanReviewFlow.tsx`                                | `incrementalFlow` entry — year step, confirm API, mismatch callout    |
| `ScanReviewModuleStack.tsx`                         | Progressive module stack (findings pattern)                           |
| `ScanReviewLastRegYearStep.tsx`                     | Step 1 year dropdown (`scanned_max_reg_year`…current year)            |
| `ScanReviewRescanCallout.tsx`                       | Orange reg_year / page callout + incremental rescan CTA               |
| `scanReviewModes.ts`                                | Entry screens, recovery variants, mode reference table                |
| `scanReviewScreenState.ts`                          | Entry-screen resolver (`resolveScanReviewScreen`) + label helpers     |
| `ScanReviewRecoveryScreen.tsx`                      | Shared recovery shell (combined / all-needs / unknown variants)       |
| `ScanReviewErrorScreen.tsx`                         | `partialPageErrors` — Page N or reg_year callout + partial rescan     |
| `ScanReviewTotalFailureScreen.tsx`                  | `totalFailure` — re-scan all + DHCR request link                      |
| `scanReviewState.ts`                                | Session persistence for `scan-review` phase + `expectedPageCount`     |
| `api/account/hooks/scanPipelineBootstrapRestore.ts` | Restore on load; pipeline redirect; bootstrap fetch                   |

Shared with Scanner: `scannerLocationState.ts` (capture intent types), `scannerFlowUtils.ts` (`navigateToPreScan`, auth guard, error mapping).

`ScanReviewFlow` handles `incrementalFlow` entry (`warningOnly`) and flow-local `warningYearMismatch` after Continue.

---

## Entry screens and resolver priority

`resolveScanReviewScreen` returns one of six entry screens. Priority (first match wins):

1. `unknownError` — non-pipeline location state, `scan_pipeline_status=failed`, or unrecoverable upload/launch failures
2. `combinedFullRescan` — `passed=false` + `possible_missing_last_page` warning + rescan signals, year step skipped
3. `allNeedsRescan` — all pages in `pages_needing_rescan`, `scanned_max_reg_year` null, no labelable pages
4. `totalFailure` — unrecoverable: no labelable pages, empty actionable metadata, or warning ineligible for incremental flow
5. `partialPageErrors` — partial errors with labelable `pages_needing_rescan`, no warning
6. `incrementalFlow` — `passed=true`, warning present, year step eligible (`flowMode: warningOnly`)

See `SCAN_REVIEW_MODE_REFERENCE` in `scanReviewModes.ts` for semantic mode conditions.

| Entry screen         | Component                      | Recovery variant (if shared) |
| -------------------- | ------------------------------ | ---------------------------- |
| `unknownError`       | `ScanReviewRecoveryScreen`     | `unknown`                    |
| `combinedFullRescan` | `ScanReviewRecoveryScreen`     | `combined`                   |
| `allNeedsRescan`     | `ScanReviewRecoveryScreen`     | `allNeedsRescan`             |
| `partialPageErrors`  | `ScanReviewErrorScreen`        | —                            |
| `totalFailure`       | `ScanReviewTotalFailureScreen` | —                            |
| `incrementalFlow`    | `ScanReviewFlow`               | —                            |

`warningYearMismatch` is a **flow-local** phase inside `ScanReviewFlow` (post-Continue), not an entry route.

---

## Re-scan invariant (no delete)

All rescan CTAs navigate to pre-scan and relaunch Dynamsoft. The client does **not** call `DELETE …/pages` or `DELETE …/pages/all`. Server dedupe handles overlapping uploads on re-finalize.

| Entry screen / flow phase                 | Pre-scan action                             | `expectedPageCount`     |
| ----------------------------------------- | ------------------------------------------- | ----------------------- |
| `partialPageErrors`                       | `navigateToPreScan` — re-scan flagged pages | Unchanged (server-side) |
| `totalFailure`                            | `navigateToPreScan` — full re-scan          | Cleared via step state  |
| `combinedFullRescan`                      | `navigateToPreScan` — full re-scan          | Cleared via step state  |
| `allNeedsRescan`                          | `navigateToPreScan` — full re-scan          | Cleared via step state  |
| `incrementalFlow` / `warningYearMismatch` | `navigateToPreScan` — add pages             | Unchanged               |
| Post-compile Restart (`/scanner`)         | Launches Dynamsoft directly                 | Unchanged               |

Non-pipeline entry paths (`showLaunchFailure`, upload failures, etc.) route to `unknownError` recovery ("Come back later" → `/account`).

---

## Session state

`scanReviewState.ts` (key `"scanner"`) stores:

```ts
{ historyId: string, phase: "scan-review", expectedPageCount?: number }
```

Written when entering scan-review from `needs_rescan`, launch failure during rescan, or explicit bootstrap. Cleared on successful finalize, `navigateToPreScan`, or when bootstrap finds no pages.

---

## Review behavior

- **`missing_year_ranges`** — gaps detected by OCR; **Next** stays disabled until filled.
- **`processing_complete`** — when false, shows a warning callout; does not block **Next**.
- **Pipeline failures** — from compiling poll `early_validation.failures` via router state.
- **Upload / launch failures** — surfaced via location state; non-pipeline paths use `unknownError` recovery.
- **Compile success** — manual only: `CompilingWaitingPage` shows FlowNav **Next** + **Restart** when pipeline is `complete`; no auto-navigate.

---

## Tests

| File                                                      | Coverage                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `scanReviewScreenState.test.ts`                           | Resolver priority, all entry screens, label helpers, recovery config                                 |
| `ScanReviewRecoveryScreen.test.tsx`                       | Recovery copy, primary/secondary CTAs, pending/error states                                          |
| `ScanReviewPage.test.tsx`                                 | Entry routing, rescan navigation (no delete), bootstrap error, incremental/combined/recovery screens |
| `ScanReviewFlow.test.tsx`                                 | Year step, confirm match/mismatch, reg_year callout, incremental rescan                              |
| `ScanReviewRescanCallout.test.tsx`                        | Page marker and year coverage callout variants                                                       |
| `api/account/hooks/scanPipelineBootstrapRestore.test.tsx` | Pipeline gate, redirect, error blocking, retry                                                       |
| `Scanner.test.tsx`                                        | Post-compile re-scan without delete, finalize lifecycle, bootstrap                                   |
| `CompilingWaitingPage.test.tsx`                           | Milestones, FlowNav on complete, failed → unknown recovery                                           |
| `scanPipelineStatus.test.tsx`                             | Poll behavior, no auto-navigate on complete, `needs_rescan` redirect                                 |

Route registration: `src/App.tsx` (`path="scan-review"`). Route protection: `App.route-protection.test.tsx`.

---

## Complexity budget (post-refactor)

- Fewer scan-review mode symbols (`errorsAndWarning` removed; combined/all-needs/unknown are entry screens)
- Zero `deleteRhScannedPages` / `deleteAllRhScannedPages` references under `Scanner/` and `ScanReviewPage/`
- `useScanPipelineStatus` has one navigation side-effect (`needs_rescan` redirect only)
- New UI surface area = 1 component file (`ScanReviewRecoveryScreen`) + resolver config objects
- No new dependencies or global state
