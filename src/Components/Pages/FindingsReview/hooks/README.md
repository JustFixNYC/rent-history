# FindingsReview hooks

## Step visibility pipeline

```
formState → module.buildAnswers(finding, formState) → answers
         → useFindingSteps(steps, answers) → filterVisibleSteps
```

### Contract

- Steps with `isVisible` must branch on **`answers`**, not raw `formState`.
- Canonical gate today: `answers.rows[1]?.gets_vacancy_increase === true` (`isVacancyGatedFollowUpVisible` in `stepVisibility.ts`).
- **New step rule:** any field that controls visibility must be written in `buildAnswers` in the same update cycle as the user’s input.

## Historical: removed `?finding_id=` query param

Findings review once read an optional `?finding_id=` URL hint (introduced in PR #37, “Finding review”) to open a specific finding from `findings_current` instead of the review queue head. The app never wrote that param on modal Next; resume paths omitted it; no shipped flow depended on it.

**Removed** in favor of `review_queue.ordered_ids[0]` plus in-session `activeFindingId` on `FindingsReviewPage`. Validate-finding **POST** `finding_id` is unchanged — only the URL query param was dropped.

## Progressive reveal

`revealedCount` in `useProgressiveReveal` is **intentionally monotonic**. When gated steps hide, `FindingModuleStack` slices `visibleSteps`, so the UX stays correct. **`data-revealed-count` may exceed the visible step count** — that attribute is for debugging only. There is **no clamp** on `revealedCount` unless QA reports toggle issues (Option A).
