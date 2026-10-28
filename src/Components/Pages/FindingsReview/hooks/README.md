# FindingsReview hooks

End-to-end flow and module layout: [../README.md](../README.md).

## Step visibility pipeline

```
formState → module.buildAnswers(finding, formState) → answers
         → useFindingSteps(steps, answers) → filterVisibleSteps
```

### Contract

- Steps with `isVisible` must branch on `answers`, not raw `formState`.
- Canonical gate today: `answers.rows[1]?.gets_vacancy_increase === true` (`isVacancyGatedFollowUpVisible` in `stepVisibility.ts`).
- **New step rule:** any field that controls visibility must be written in `buildAnswers` in the same update cycle as the user’s input.

## Progressive reveal

`revealedCount` in `useProgressiveReveal` is **intentionally monotonic**. When gated steps hide, `FindingModuleStack` slices `visibleSteps`, so the UX stays correct. `data-revealed-count` **may exceed the visible step count** — that attribute is for debugging only. There is **no clamp** on `revealedCount` unless QA reports toggle issues (Option A).
