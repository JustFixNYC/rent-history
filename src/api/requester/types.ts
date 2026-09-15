import type { components } from "../generated/requester-openapi";

type Schemas = components["schemas"];

/** Public partner org fields from `GET /rh-request/partners/{slug}`. */
export type PartnerOrgPublic = Schemas["PartnerOrgPublic"];

/** `POST /rh-request/send-request` request body. */
export type SendRhRequestRequest = Schemas["SendRhRequestRequest"];

/** `POST /rh-request/send-request` success body. */
export type SendRhRequestResponse = Schemas["SendRhRequestResponse"];

/** 503 body when DHCR email send fails. */
export type RhRequestServiceError = Schemas["RhRequestServiceError"];

export type RequesterLocale = Schemas["LocaleEnum"];

export type RequesterSource = Schemas["SourceEnum"];
