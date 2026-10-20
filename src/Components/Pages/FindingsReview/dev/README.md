# Findings review dev sandbox

UI preview for finding validation flows (mock data, no login or scan). Part of the permanent `/dev` section (local development only).

## Run locally

```bash
cd rent-history && npm run dev
```

- Hub: **http://localhost:5173/en/dev**
- Timeline previews: **http://localhost:5173/en/dev/timeline**
- Findings sandbox: **http://localhost:5173/en/dev/findings-review**

Optional deep link: `?type=OVERCHARGE_PREFRENTREMOVED_POSTHSTPA`

## Toolbar

| Control                | Purpose                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| **Finding type**       | Switches among fixture-backed modules in `__fixtures__/findingExamples.json`. |
| **Submit scenario**    | Success (modal), API error (alert), or null result (alert).                   |
| **Result kind**        | When success: `no_violation`, `potential_violation`, or `dismissed`.          |
| **Queue after submit** | Empty → modal **View report**; one more → modal **Next** (second fixture).    |

Style changes belong in production files (`FindingsReview.scss`, steps, modals, etc.); Vite HMR applies them here.

## Production verification

```bash
npm run build && npm run preview
```

`/en/dev`, `/en/dev/timeline`, and `/en/dev/findings-review` should not load dev UI (routes omitted when `import.meta.env.DEV` is false).
