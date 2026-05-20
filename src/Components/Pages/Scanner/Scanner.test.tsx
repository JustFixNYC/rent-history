import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Scanner from "./Scanner";
import { RhAuthApiError } from "../../../api/rhAuth";
import * as rhAuthApi from "../../../api/rhAuth";
import {
  getRhSessionAnalysisPages,
  setRhAuthSession,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";

const { navigateMock, testHistoryId } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  testHistoryId: "22222222-2222-4222-8222-222222222222",
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("dynamsoft-document-scanner", () => ({
  DocumentScanner: vi.fn(function DocumentScannerMock(
    this: { launch: ReturnType<typeof vi.fn> },
    config?: {
      onDocumentScanned?: (result: {
        correctedImageResult?: { toBlob: (type: string) => Promise<Blob> };
      }) => void | Promise<void>;
    }
  ) {
    this.launch = vi.fn().mockImplementation(async () => {
      if (config?.onDocumentScanned) {
        await config.onDocumentScanned({
          correctedImageResult: {
            toBlob: async () => new Blob(),
          },
        });
      }
    });
  }),
}));

vi.mock("../../../api/presignedS3", () => ({
  uploadScan: vi.fn().mockResolvedValue(undefined),
  downloadScans: vi.fn().mockResolvedValue([
    {
      key: `1/${testHistoryId}/page1.jpg`,
      response: {
        ok: true,
        status: 200,
        blob: async () => new Blob(),
      },
    },
  ]),
}));

vi.mock("../../EmblaCarousel/EmblaCarousel", () => ({
  default: () => null,
}));

vi.mock("../../../api/rhAuth", async () => {
  const actual = await vi.importActual<typeof import("../../../api/rhAuth")>(
    "../../../api/rhAuth"
  );
  return {
    ...actual,
    combineRhHistoryPages: vi.fn(),
    deleteRhHistoryPages: vi.fn(),
    getRhHistoryPagesReadiness: vi.fn().mockResolvedValue({
      outcome: "ready",
      body: {
        s3: { count: 1, expected: 1, relation: "equal" },
        database: { count: 1, expected: 1, relation: "equal" },
        pages: [
          {
            needs_retake: false,
            s3_key: `1/${testHistoryId}/page1.jpg`,
            start_year: 2020,
            end_year: 2021,
            is_coverpage: false,
          },
        ],
      },
    }),
    getRhHistoryAnalysisPages: vi.fn().mockResolvedValue([
      {
        s3_key: `1/${testHistoryId}/page1.jpg`,
        start_year: 2020,
        end_year: 2021,
      },
    ]),
  };
});

const tokenPayload = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "Bearer",
  expires_in: 300,
  scope: "read write",
  profile: {
    id: 1,
    phone_number: "15554443333",
    rent_history_id: "rh-1",
  },
};

const historyId = testHistoryId;

const renderScanner = () => {
  i18n.load("en", {});
  i18n.activate("en");
  return render(
    <MemoryRouter initialEntries={["/en/scanner"]}>
      <I18nProvider i18n={i18n}>
        <Scanner />
      </I18nProvider>
    </MemoryRouter>
  );
};

const advanceToScanComplete = async () => {
  const startButton = await screen.findByRole("button", {
    name: "Start scanning",
  });
  fireEvent.click(startButton);
  return screen.findByRole("button", { name: "Next" });
};

describe("Scanner Next button", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
    setRhAuthSession(tokenPayload);
    setRhHistoryId(historyId);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls combine-pages and navigates to /confirm-address on success", async () => {
    vi.mocked(rhAuthApi.combineRhHistoryPages).mockResolvedValue({
      status: "ok",
    });

    renderScanner();
    const nextButton = await advanceToScanComplete();
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(rhAuthApi.combineRhHistoryPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
      expect(rhAuthApi.getRhHistoryAnalysisPages).toHaveBeenCalledWith(
        "access-token",
        historyId
      );
      expect(getRhSessionAnalysisPages()).toEqual([
        {
          s3_key: `1/${testHistoryId}/page1.jpg`,
          start_year: 2020,
          end_year: 2021,
        },
      ]);
      expect(navigateMock).toHaveBeenCalledWith("/en/confirm-address");
    });
  });

  it("shows backend error message and stays on scanner when combine-pages fails", async () => {
    vi.mocked(rhAuthApi.combineRhHistoryPages).mockRejectedValue(
      new RhAuthApiError(400, "reg_year sequence is not contiguous")
    );

    renderScanner();
    const nextButton = await advanceToScanComplete();
    fireEvent.click(nextButton);

    await screen.findByText("reg_year sequence is not contiguous");
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
