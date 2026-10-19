# Findings review dev sandbox

Temporary UI preview for finding validation flows (mock data, no login or scan).

## Run locally

```bash
cd rent-history && npm run dev
```

Open: **http://localhost:5173/en/dev/findings-review**

Optional deep link: `?type=OVERCHARGE_PREFRENTREMOVED_POSTHSTPA`

## Toolbar

| Control | Purpose |
| -------- | -------- |
| **Finding type** | Switches among fixture-backed modules in `__fixtures__/findingExamples.json`. |
| **Submit scenario** | Success (modal), API error (alert), or null result (alert). |
| **Result kind** | When success: `no_violation`, `potential_violation`, or `dismissed`. |
| **Queue after submit** | Empty → modal **View report**; one more → modal **Next** (second fixture). |

Style changes belong in production files (`FindingsReview.scss`, steps, modals, etc.); Vite HMR applies them here.

## Remove before a clean PR

1. Delete this `dev/` folder (sandbox + this README).
2. Remove the DEV route from `src/App.tsx`.
3. Remove optional `devValidateMutate` / `devValidateIsPending` props from `FindingReviewFlow.tsx` (if nothing else uses them).
4. Remove the link on `DevPage` (if added).

Confirm production build:

```bash
npm run build && npm run preview
```

`/en/dev/findings-review` should not load the sandbox (route omitted when `import.meta.env.DEV` is false).
