import { z } from "zod";

import {
  getRhSessionStepState,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";

export type AddressFlowState =
  | "confirmExtracted"
  | "editAddress"
  | "enterAddress"
  | "confirmUpdated";

export type AddressState = {
  streetAddress: string;
  unitNumber: string;
  cityStateZip: string;
  longLat: string | null;
  bbl: string | null;
  bin: string | null;
};

export type RentQuestionsState = {
  monthlyRent: string;
};

export type PostScanFlowState = {
  addressFlowState: AddressFlowState;
  confirmedAddress: AddressState;
  draftAddress: AddressState;
  rentQuestions: RentQuestionsState;
};

export const EXTRACTED_ADDRESS: AddressState = {
  streetAddress: "228 Atlantic Avenue",
  unitNumber: "1",
  cityStateZip: "Brooklyn, New York 11201",
  longLat: null,
  bbl: null,
  bin: null,
};

export const UPDATED_ADDRESS: AddressState = {
  streetAddress: "220 Atlantic Avenue",
  unitNumber: "1",
  cityStateZip: "Brooklyn, New York 11201",
  longLat: null,
  bbl: null,
  bin: null,
};

const DEFAULT_STATE: PostScanFlowState = {
  addressFlowState: "confirmExtracted",
  confirmedAddress: EXTRACTED_ADDRESS,
  draftAddress: { ...EXTRACTED_ADDRESS, unitNumber: "" },
  rentQuestions: {
    monthlyRent: "",
  },
};

const addressStateSchema = z.object({
  streetAddress: z.string(),
  unitNumber: z.string(),
  cityStateZip: z.string(),
  longLat: z.string().nullable(),
  bbl: z.string().nullable(),
  bin: z.string().nullable(),
});

const rentQuestionsStateSchema = z.object({
  monthlyRent: z.string(),
});

const postScanStateSchema = z.object({
  addressFlowState: z.enum([
    "confirmExtracted",
    "editAddress",
    "enterAddress",
    "confirmUpdated",
  ]),
  confirmedAddress: addressStateSchema,
  draftAddress: addressStateSchema,
  rentQuestions: rentQuestionsStateSchema,
});

export const POST_SCAN_STEP_STATE_KEY = "postScanFlow";

export const readPostScanFlowState = (): PostScanFlowState =>
  getRhSessionStepState(POST_SCAN_STEP_STATE_KEY, postScanStateSchema) ??
  DEFAULT_STATE;

export const writePostScanFlowState = (state: PostScanFlowState): void =>
  setRhSessionStepState(POST_SCAN_STEP_STATE_KEY, state);

