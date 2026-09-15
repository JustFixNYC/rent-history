import { getAuthProviderBaseUrl } from "../shared/env";
import {
  bearerHeaders,
  createRequesterClient,
  unwrapRequesterResponse,
} from "./client";
import type {
  PartnerOrgPublic,
  SendRhRequestRequest,
  SendRhRequestResponse,
} from "./types";

const getRhRequestApiToken = (): string => {
  const apiToken = import.meta.env.VITE_RH_REQUEST_API_TOKEN as
    | string
    | undefined;
  if (!apiToken) {
    throw new Error("VITE_RH_REQUEST_API_TOKEN is not configured.");
  }
  return apiToken;
};

const getRequesterClient = () =>
  createRequesterClient(getAuthProviderBaseUrl());

/** `GET /rh-request/partners/{slug}` — public; no bearer token. */
export const getPartnerBySlug = (slug: string): Promise<PartnerOrgPublic> =>
  unwrapRequesterResponse(
    getRequesterClient().GET("/rh-request/partners/{slug}/", {
      params: { path: { slug } },
    })
  );

/** `POST /rh-request/send-request` — static bearer; 503 throws with `email_send_failed`. */
export const sendRhRequest = (
  body: SendRhRequestRequest
): Promise<SendRhRequestResponse> =>
  unwrapRequesterResponse(
    getRequesterClient().POST("/rh-request/send-request", {
      headers: bearerHeaders(getRhRequestApiToken()),
      body,
    })
  );
