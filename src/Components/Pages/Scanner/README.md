# Scanner

Document capture at `/:locale/scanner`. Users photograph each page of their rent history with the device camera; on exit with pages captured, the app finalizes and navigates to the compiling waiting screen.

Scan review and recovery live on the dedicated [`/scan-review` route](../ScanReviewPage/README.md).

**Prerequisites:** OTP login session (`rhSessionStorage`) and a rent-history record (`historyId`, created on mount if missing).

---

## Phase flow

`Scanner.tsx` is the capture orchestrator. It renders one screen per `ScannerPhase`:

| Phase           | Screen                                                                                       | Persisted?     |
| --------------- | -------------------------------------------------------------------------------------------- | -------------- |
| `pre-scan`      | `PreScanScreen` — tips + “Start scanning” (or “Skip or Re-scan” in post-compile return mode) | Default only   |
| `camera-access` | `CameraAccessScreen` — permission instructions                                               | No (transient) |
| `scanning`      | Dynamsoft UI + `ScannerInProgressScreen` + optional `ScannerOverlay`                         | No (transient) |

```
pre-scan ──Start──► scanning ──Done (count>0)──► finalize-scan ──► /compiling
    ▲                    │                              │
    │                    │ denied                     └── poll → findings-overview / report
    └── camera-access ◄──┘

/scan-review ──captureIntent──► /scanner ──Done──► finalize-scan ──► /compiling
                    │ failure
                    └──► /scan-review (launch/upload failure state)

saved scan-review session ──► redirect to /scan-review (no Dynamsoft init)

Compiling POP + Restart ──► pre-scan (postCompileReturn) ──Skip or Re-scan──► SkipOrRescanModal
```

On return visits, `useScannerBootstrapRestore` reads persisted step state (scoped to active `historyId`), redirects saved `scan-review` sessions to `/scan-review`, checks scan-pipeline status (redirect to `/compiling` when non-terminal), and restores pre-scan otherwise. If `GET /rh/history/scan-pipeline-status` fails during bootstrap, phase restore is blocked until the user retries successfully — the page shows an error callout with **Try again** instead of falling through to pre-scan or scan-review redirect.

---

## Capture pipeline

1. **Dynamsoft** — `useDocumentScanner` lazy-inits `DocumentScanner` when entering scanning or handling a `ScannerCaptureIntent` auto-launch. Disposed on unmount.
2. **`onDocumentScanned`** — corrected JPEG blob uploaded via presigned S3 URL (`uploadScan` in `api/account/scanPresign.ts`). Key shape: `{profileId}/{historyId}/{uuid}.jpg`.
3. **Finalize** — on Dynamsoft exit with `count > 0`, `POST /rh/history/finalize-scan` then navigate to `/{locale}/compiling` (or back to `/scan-review` on failure per capture intent).
4. **Capture intent** — location state from `/scan-review` (`rescan`, `addMore`, `restart`) auto-launches Dynamsoft on mount.

Dynamsoft renders inside shadow DOM. `scanner-overlay.ts` walks that tree to probe live-view visibility, patch the “Done (n)” button label for i18n, and detect camera-permission errors.

---

## Module contents

| File / folder                         | Role                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `Scanner.tsx`                         | Phase state, capture lifecycle, finalize-scan, capture-intent auto-launch         |
| `PreScanScreen.tsx`                   | Pre-scan copy and tips; `postCompileReturn` variant                               |
| `SkipOrRescanModal/`                  | Skip vs full re-scan after returning from completed compiling page                |
| `CameraAccessScreen.tsx`              | Camera permission recovery                                                        |
| `ScannerInProgressScreen.tsx`         | Loading shell while Dynamsoft is active                                           |
| `ScannerOverlay.tsx`                  | US-letter aspect-ratio guide portal over Dynamsoft live view                      |
| `scannerLocationState.ts`             | `ScannerCaptureIntent` and location-state types for scanner ↔ scan-review handoff |
| `scannerTypes.ts`                     | `ScannerPhase` union type (`pre-scan`, `camera-access`, `scanning`)               |
| `scannerFlowUtils.ts`                 | Auth/history guard + API error mapping                                            |
| `scanner-overlay.ts`                  | Dynamsoft DOM helpers (visibility, labels, camera probe)                          |
| `hooks/useDocumentScanner.ts`         | Lazy Dynamsoft init, launch, dispose                                              |
| `hooks/useScannerHistoryCreate.ts`    | Ensures `historyId` exists via `POST` create                                      |
| `hooks/useScannerBootstrapRestore.ts` | Restore phase on load; redirect scan-review session; pipeline→compiling redirect  |
| `hooks/useScanPipelineBootstrap.ts`   | One-shot pipeline status for post-compile return mode                             |

Review UI, hooks, and session state live under [`ScanReviewPage/`](../ScanReviewPage/README.md).

Post-combine analysis pages (`useHistoryAnalysisPages`) live in `src/api/account/hooks/analysisPages.ts` and are consumed by `src/hooks/useRentHistoryDocumentPages.ts` (document viewer modal).

---

## Session persistence

Scanner does not persist its own phase. Saved `scan-review` step state (`ScanReviewPage/scanReviewState.ts`, key `"scanner"`) causes a redirect to `/scan-review` on mount — Dynamsoft is not initialized in that case.

Transient phases (`scanning`, `camera-access`) are not persisted. Unmount or tab hide during active scan does not finalize; abandoned sessions may be auto-finalized server-side after an idle threshold.

---

## External dependencies

| Dependency                   | Usage                            |
| ---------------------------- | -------------------------------- |
| `dynamsoft-document-scanner` | Camera capture UI                |
| `@tanstack/react-query`      | Pipeline cache                   |
| `@lingui/*`                  | Copy and Dynamsoft button labels |
| `VITE_DYNAMSOFT_LICENSE_KEY` | Dynamsoft license (env)          |

---

## Tests

| File                                        | Coverage                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Scanner.test.tsx`                          | Capture, finalize, overlay, capture-intent, bootstrap redirect, pipeline bootstrap error |
| `hooks/useScannerBootstrapRestore.test.tsx` | Pipeline gate, redirect, error blocking, retry, `shouldBootstrapCompiling`               |
| `PreScanScreen` / `SkipOrRescanModal`       | Post-compile return mode and modal actions                                               |
| `scannerFlowUtils.test.ts`                  | Context guard, error mapping                                                             |
| `scanner-overlay.test.ts`                   | DOM visibility helpers, label patching                                                   |
| `../ScanReviewPage/ScanReviewPage.test.tsx` | Scan-review finalize, callouts, bootstrap restore                                        |

Route registration: `src/App.tsx` (`path="scanner"`). Route protection: `App.route-protection.test.tsx`.
