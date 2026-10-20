import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

import DevHubPage from "./DevHubPage";
import DevPageLayout from "./DevPageLayout";
import DevTimelinePage from "./DevTimelinePage";

const FindingsReviewDevSandbox = lazy(
  () => import("../FindingsReview/dev/FindingsReviewDevSandbox")
);

const DevFindingsReviewRoute = () => (
  <Suspense fallback={<p>Loading findings review sandbox…</p>}>
    <FindingsReviewDevSandbox />
  </Suspense>
);

export const devRoutes = import.meta.env.DEV ? (
  <Route path="dev" element={<DevPageLayout />}>
    <Route index element={<DevHubPage />} />
    <Route path="timeline" element={<DevTimelinePage />} />
    <Route path="findings-review" element={<DevFindingsReviewRoute />} />
  </Route>
) : null;
