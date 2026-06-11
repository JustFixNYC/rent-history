import { setupWorker } from "msw/browser";

import { findingsReviewHandlers } from "../../Components/Pages/FindingsReview/mocks/findingsReviewHandlers";

export const findingsReviewWorker = setupWorker(...findingsReviewHandlers);
