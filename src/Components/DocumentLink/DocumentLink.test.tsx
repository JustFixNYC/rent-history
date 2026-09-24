import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as accountApi from "../../api/account/api";
import { DocumentLink } from "./DocumentLink";
import { RhSessionProvider } from "../../session/RhSessionContext";
import {
  clearRhFlowSession,
  setRhAuthSession,
  setRhHistoryId,
  setRhSessionAnalysisPages,
} from "../../session/rhSessionStorage";

vi.mock("../../api/account/scanPresign", () => ({
  downloadScans: vi.fn(),
}));

import { downloadScans } from "../../api/account/scanPresign";

const historyId = "22222222-2222-4222-8222-222222222222";

const tokenPayload = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "Bearer",
  expires_in: 300,
  scope: "read write",
  profile: {
    id: 1,
    phone_number: "15554443333",
  },
};

const analysisPages = [
  {
    s3_key: `1/${historyId}/page1.jpg`,
    start_year: 2020,
    end_year: 2021,
  },
];

const renderDocumentLink = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider i18n={i18n}>
        <RhSessionProvider>
          <DocumentLink />
        </RhSessionProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
};

describe("DocumentLink", () => {
  beforeEach(() => {
    i18n.load("en", {});
    i18n.activate("en");
    vi.spyOn(accountApi, "getRhHistoryAnalysisPages");
    clearRhFlowSession();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
    setRhSessionAnalysisPages(analysisPages);
    vi.mocked(downloadScans).mockResolvedValue([
      {
        key: analysisPages[0].s3_key,
        response: new Response("image-bytes", {
          status: 200,
          headers: { "Content-Type": "image/jpeg" },
        }),
      },
    ]);
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:document-page"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    clearRhFlowSession();
  });

  it("opens modal with session-backed page cards", async () => {
    renderDocumentLink();

    fireEvent.click(screen.getByRole("button", { name: /your rent history/i }));

    await waitFor(() => {
      expect(
        screen.getByTestId("document-pages-modal-content")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`rent-history-page-card-${analysisPages[0].s3_key}`)
    ).toBeInTheDocument();
    expect(downloadScans).toHaveBeenCalledWith([analysisPages[0].s3_key]);
    expect(accountApi.getRhHistoryAnalysisPages).not.toHaveBeenCalled();
  });

  it("falls back to analysis-pages when session pages are empty", async () => {
    clearRhFlowSession();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);

    vi.mocked(accountApi.getRhHistoryAnalysisPages).mockResolvedValue(
      analysisPages
    );

    renderDocumentLink();

    fireEvent.click(screen.getByRole("button", { name: /your rent history/i }));

    await waitFor(() => {
      expect(accountApi.getRhHistoryAnalysisPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("document-pages-modal-content")
      ).toBeInTheDocument();
    });
  });

  it("fetches analysis pages when session pages belong to a different history", async () => {
    const otherHistoryId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    setRhSessionAnalysisPages([
      {
        s3_key: `1/${otherHistoryId}/page1.jpg`,
        start_year: 2020,
        end_year: 2021,
      },
    ]);

    vi.mocked(accountApi.getRhHistoryAnalysisPages).mockResolvedValue(
      analysisPages
    );

    renderDocumentLink();

    fireEvent.click(screen.getByRole("button", { name: /your rent history/i }));

    await waitFor(() => {
      expect(accountApi.getRhHistoryAnalysisPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`rent-history-page-card-${analysisPages[0].s3_key}`)
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId(
        `rent-history-page-card-1/${otherHistoryId}/page1.jpg`
      )
    ).not.toBeInTheDocument();
  });
});
