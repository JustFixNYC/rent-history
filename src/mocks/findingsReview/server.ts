import { setupServer } from "msw/node";

import { findingsReviewHandlers } from "../../Components/Pages/FindingsReview/mocks/findingsReviewHandlers";

export const findingsReviewServer = setupServer(...findingsReviewHandlers);
