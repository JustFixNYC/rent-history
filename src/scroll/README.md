# App scroll reset

Rent-history scrolls inside **`#main`**, not the document window, because of the sidebar app layout. See [`PageLayout.scss`](../Components/Pages/PageLayout/PageLayout.scss) and [`PageLayout.tsx`](../Components/Pages/PageLayout/PageLayout.tsx).

React Router’s `<ScrollRestoration />` and `window.scrollTo()` only move the **window**, so route changes used to leave `#main` scrolled partway down. This folder centralizes scrolling the real container.

## API

| Export                     | Role                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppScrollProvider`        | Holds a ref to the scroll root; provides `scrollToTop` via context.                                                                                                |
| `useAppScroll()`           | `{ containerRef, scrollToTop }` for imperative resets (e.g. pagination). Without a provider, `scrollToTop` still targets `#main` via DOM lookup (useful in tests). |
| `ScrollToTopOnRouteChange` | Mount once in the layout; resets on `pathname` / `search` (including back/forward).                                                                                |
| `useScrollToTopWhen(key)`  | Reset when `key` changes but the route does not (wizard step, phase, active item). Skips when `key` is `null` / `undefined`.                                       |
| `scrollAppContainerToTop`  | Low-level helper; prefer context in components.                                                                                                                    |

Default scroll is **instant** (`behavior: "auto"`).

## Setup in this repo

1. **`PageLayout`** — `AppScrollProvider` + `ref` on `<main id="main">`, `<ScrollToTopOnRouteChange />`. No `<ScrollRestoration />`.
2. **`main.tsx`** — `history.scrollRestoration = "manual"` so the browser does not restore window scroll independently.

## Virtual pages (`useScrollToTopWhen`)

Use when the URL is unchanged but the user sees a new “screen”:

- [`FindingsReviewPage`](../Components/Pages/FindingsReview/FindingsReviewPage.tsx) — `activeFindingId`
- [`RentQuestions`](../Components/Pages/RentQuestions/RentQuestions.tsx) — `substep`
- [`Scanner`](../Components/Pages/Scanner/Scanner.tsx) — `phase`

Within a single finding, step reveal still uses local `scrollIntoView` in `FindingReviewFlow` (not this module).

## Porting to another app

1. Find the element users actually scroll (DevTools: which node has non-zero `scrollTop`?).
2. Add `AppScrollProvider` in the root layout and attach `containerRef` to that element (or keep `id="main"` and rely on the fallback lookup).
3. Render `<ScrollToTopOnRouteChange />` inside the provider (must be under React Router).
4. For in-route steps, call `useScrollToTopWhen(stateKey)` in the page or flow component.
5. Remove `<ScrollRestoration />` if it targeted the wrong root; replace `window.scrollTo` with `useAppScroll().scrollToTop()`.
6. Set `history.scrollRestoration = "manual"` at bootstrap if you always reset to top.

## Caveats

- **Nested scrollers** (e.g. sidebar nav) are separate; this module only resets the main content root.
- **Exceptions** — React Router `preventScrollReset` on specific links is unused here; add only if a route must keep scroll.
- **Tests** — jsdom may not implement `scrollTo` on elements; use refs and assert `scrollTop` or mock `scrollTo` as needed.
