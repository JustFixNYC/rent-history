import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { findingsReviewServer } from "../mocks/findingsReview/server";

Object.defineProperty(window, "scrollTo", {
  value: () => {},
  writable: true,
});

beforeAll(() => {
  findingsReviewServer.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  findingsReviewServer.resetHandlers();
});

afterAll(() => {
  findingsReviewServer.close();
});
