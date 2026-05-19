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

export type ConfirmAddressState = {
  addressFlowState: AddressFlowState;
  confirmedAddress: AddressState;
  draftAddress: AddressState;
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

const addressStateSchema = z.object({
  streetAddress: z.string(),
  unitNumber: z.string(),
  cityStateZip: z.string(),
  longLat: z.string().nullable(),
  bbl: z.string().nullable(),
  bin: z.string().nullable(),
});

const confirmAddressStateSchema = z.object({
  addressFlowState: z.enum([
    "confirmExtracted",
    "editAddress",
    "enterAddress",
    "confirmUpdated",
  ]),
  confirmedAddress: addressStateSchema,
  draftAddress: addressStateSchema,
});

const DEFAULT_STATE: ConfirmAddressState = {
  addressFlowState: "confirmExtracted",
  confirmedAddress: EXTRACTED_ADDRESS,
  draftAddress: { ...EXTRACTED_ADDRESS, unitNumber: "" },
};

export const CONFIRM_ADDRESS_STEP_STATE_KEY = "confirmAddress";

export const readConfirmAddressState = (): ConfirmAddressState =>
  getRhSessionStepState(
    CONFIRM_ADDRESS_STEP_STATE_KEY,
    confirmAddressStateSchema
  ) ?? DEFAULT_STATE;

export const writeConfirmAddressState = (state: ConfirmAddressState): void =>
  setRhSessionStepState(CONFIRM_ADDRESS_STEP_STATE_KEY, state);
