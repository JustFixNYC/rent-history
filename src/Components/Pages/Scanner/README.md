# Scanner

Rent-history document scanning flow at `/:locale/scanner`. Users photograph each page of their rent history with the device camera, then continue to the compiling waiting screen while the server processes scans.

**Prerequisites:** OTP login session (`rhSessionStorage`) and a rent-history record (`historyId`, created on mount if missing).

---

## Phase flow

`Scanner.tsx` is the orchestrator. It renders one screen per `ScannerPhase`:

| Phase           | Screen                                                                                       | Persisted?        |
| --------------- | -------------------------------------------------------------------------------------------- | ----------------- |
| `pre-scan`      | `PreScanScreen` — tips + “Start scanning” (or “Skip or Re-scan” in post-compile return mode) | Default only      |
| `camera-access` | `CameraAccessScreen` — permission instructions                                               | No (transient)    |
| `scanning`      | Dynamsoft UI + `ScannerInProgressScreen` + optional `ScannerOverlay`                         | No (transient)    |
| `scan-review`   | `ScanReviewScreen` — rescan path only (`needs_rescan` or launch failure)                     | Yes (rescan path) |

```
pre-scan ──Start──► scanning ──Done (count>0)──► finalize-scan ──► /compiling
    ▲                    │                              │
    │                    │ denied                     └── poll → findings-overview / report
    └── camera-access ◄──┘

needs_rescan (from compiling poll) ──► scan-review ──add/rescan──► scanning ──Done──► finalize-scan ──► /compiling
                                              │
                                              └── Restart ──► scanning (clears all)

Compiling POP + Restart ──► pre-scan (postCompileReturn) ──Skip or Re-scan──► SkipOrRescanModal
```

On return visits, `useScannerBootstrapRestore` reads persisted step state (scoped to active `historyId`), checks scan-pipeline status (redirect to `/compiling` when non-terminal), and/or asks the backend whether in-progress pages exist for rescan recovery.

---

## Scan capture pipeline

1. **Dynamsoft** — `DocumentScanner` (continuous scanning, auto-crop, frame verification). Configured in `Scanner.tsx` on mount; disposed on unmount.
2. **`onDocumentScanned`** — corrected JPEG blob uploaded via presigned S3 URL (`uploadScan` in `api/account/scanPresign.ts`). Key shape: `{profileId}/{historyId}/{uuid}.jpg`.
3. **Finalize** — on Dynamsoft exit with `count > 0` only, `POST /rh/history/finalize-scan` then navigate to `/{locale}/compiling`.
4. **Rescan review** — when compiling poll returns `needs_rescan`, FE navigates to scan-review with failure callouts. Poll `GET …/scan-review` until ready (`useScanReview`).
5. **Review UI** — presigned download URLs for thumbnails (`useScanReviewPageImages` → `usePresignedPageImageUrls`).

Dynamsoft renders inside shadow DOM. `scanner-overlay.ts` walks that tree to probe live-view visibility, patch the “Done (n)” button label for i18n, and detect camera-permission errors.

---

## Module contents

| File / folder                         | Role                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Scanner.tsx`                         | Phase state, Dynamsoft lifecycle, finalize-scan, handlers (start, restart, rescan, add more) |
| `PreScanScreen.tsx`                   | Pre-scan copy and tips; `postCompileReturn` variant                                          |
| `SkipOrRescanModal/`                  | Skip vs full re-scan after returning from completed compiling page                           |
| `CameraAccessScreen.tsx`              | Camera permission recovery                                                                   |
| `ScannerInProgressScreen.tsx`         | Loading shell while Dynamsoft is active                                                      |
| `ScanReviewScreen.tsx`                | Rescan-path review layout; delegates callouts and retake group                               |
| `ScanReviewCallouts.tsx`              | Year-gap, processing, upload/launch failure, pipeline failure, add-more callouts             |
| `ScanReviewRetakeGroup.tsx`           | Pages flagged `needs_retake`                                                                 |
| `ScannerOverlay.tsx`                  | US-letter aspect-ratio guide portal over Dynamsoft live view                                 |
| `scannerState.ts`                     | Session persistence for rescan-path `scan-review` + `expectedPageCount`                      |
| `scannerTypes.ts`                     | `ScannerPhase` union type                                                                    |
| `scannerFlowUtils.ts`                 | Auth/history guard + API error mapping                                                       |
| `scanner-overlay.ts`                  | Dynamsoft DOM helpers (visibility, labels, camera probe)                                     |
| `scanReviewUtils.ts`                  | `isScanReviewClean` — no missing years and no retakes                                        |
| `hooks/useScannerHistoryCreate.ts`    | Ensures `historyId` exists via `POST` create                                                 |
| `hooks/useScannerBootstrapRestore.ts` | Restore phase on load; redirect to compiling when pipeline active                            |
| `hooks/useScanPipelineBootstrap.ts`   | One-shot pipeline status for post-compile return mode                                        |
| `hooks/useScanReviewPageImages.ts`    | Presigned URLs for review thumbnails                                                         |
| `hooks/useScanReview.ts`              | Poll `scan-review` until ready or partial timeout                                            |
| `hooks/useScanReviewBootstrap.ts`     | One-shot bootstrap fetch on load (restore scan-review)                                       |

Post-combine analysis pages (`useHistoryAnalysisPages`) live in `src/api/account/hooks/analysisPages.ts` and are consumed by `src/hooks/useRentHistoryDocumentPages.ts` (document viewer modal).

---

## Session persistence

Only **rescan-path `scan-review`** is written to session storage (`scannerState.ts`, key `"scanner"`):

```ts
{ historyId: string, phase: "scan-review", expectedPageCount: number }
```

Written when entering scan-review from `needs_rescan`, launch failure during rescan, or explicit rescan bootstrap — **not** on the happy path (finalize → compiling instead).

`readScannerStepState()` returns `null` when stored `historyId` does not match the active session. `expectedPageCount` tracks client upload count; scan-review poll uses it so the backend knows how many S3 objects to wait for.

Transient phases (`scanning`, `camera-access`) are not persisted. Unmount or tab hide during active scan does not flush to scan-review and does not finalize; abandoned sessions may be auto-finalized server-side after an idle threshold.

`clearScannerStepState()` runs when restarting, re-scanning selected pages, successful finalize, or bootstrap finds no pages.

---

## Scan review behavior (rescan path only)

- **`missing_year_ranges`** — gaps detected by OCR; **Next** stays disabled until filled (user adds pages or rescans).
- **`processing_complete`** — when false, shows a warning callout; does not block **Next**.
- **Pipeline failures** — from compiling poll `early_validation.failures` via router state.
- **Upload / launch failures** — surfaced as info callouts; user can re-scan missing pages.
- **`needs_retake`** — poor-quality pages grouped in `ScanReviewRetakeGroup`; re-scan deletes those page records server-side, then relaunches Dynamsoft.
- **Restart** — confirms via `ConfirmModal`, deletes all scanned pages, resets count, relaunches scanner.
- **Next / Dynamsoft exit** — `POST /rh/history/finalize-scan`, navigate to `/{locale}/compiling`.

---

## External dependencies

| Dependency                   | Usage                                  |
| ---------------------------- | -------------------------------------- |
| `dynamsoft-document-scanner` | Camera capture UI                      |
| `@tanstack/react-query`      | Scan-review polling and pipeline cache |
| `@lingui/*`                  | Copy and Dynamsoft button labels       |
| `VITE_DYNAMSOFT_LICENSE_KEY` | Dynamsoft license (env)                |

---

## Tests

| File                                    | Coverage                                                |
| --------------------------------------- | ------------------------------------------------------- |
| `Scanner.test.tsx`                      | Phase rendering, finalize-scan happy path, rescan flows |
| `PreScanScreen` / `SkipOrRescanModal`   | Post-compile return mode and modal actions              |
| `scannerState.test.ts`                  | Session read/write/clear                                |
| `scannerFlowUtils.test.ts`              | Context guard, error mapping                            |
| `scanner-overlay.test.ts`               | DOM visibility helpers, label patching                  |
| `hooks/useScanReviewBootstrap.test.tsx` | Bootstrap fetch behavior                                |
| `hooks/useScanReview.test.tsx`          | Poll and accept-partial timeout behavior                |

Route registration: `src/App.tsx` (`path="scanner"`). Route protection: `App.route-protection.test.tsx`.
