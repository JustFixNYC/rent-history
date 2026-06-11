import { bearerHeaders } from "./client";
import type {
  FindingsStateResponse,
  ValidateFindingRequest,
  ValidateFindingResponse,
} from "../../Components/Pages/FindingsReview/types";
import { getAuthProviderBaseUrl } from "./api";

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Findings API request failed (${response.status}): ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
};

export const getRhFindingsState = async (
  accessToken: string,
  historyId: string
): Promise<FindingsStateResponse> => {
  const url = new URL(`${getAuthProviderBaseUrl()}/rh/history/findings-state`);
  url.searchParams.set("history_id", historyId);

  const response = await fetch(url, {
    headers: bearerHeaders(accessToken),
  });

  return parseJsonResponse<FindingsStateResponse>(response);
};

export const validateRhFinding = async (
  accessToken: string,
  body: ValidateFindingRequest
): Promise<ValidateFindingResponse> => {
  const response = await fetch(
    `${getAuthProviderBaseUrl()}/rh/history/validate-finding`,
    {
      method: "POST",
      headers: {
        ...bearerHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  return parseJsonResponse<ValidateFindingResponse>(response);
};
