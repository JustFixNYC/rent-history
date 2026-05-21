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

export const emptyAddressState = (): AddressState => ({
  streetAddress: "",
  unitNumber: "",
  cityStateZip: "",
  longLat: null,
  bbl: null,
  bin: null,
});

export type ConfirmAddressState = {
  addressFlowState: AddressFlowState;
  confirmedAddress: AddressState;
  draftAddress: AddressState;
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

export const CONFIRM_ADDRESS_STEP_STATE_KEY = "confirmAddress";

export const readConfirmAddressState = (): ConfirmAddressState | null =>
  getRhSessionStepState(
    CONFIRM_ADDRESS_STEP_STATE_KEY,
    confirmAddressStateSchema
  ) ?? null;

export const writeConfirmAddressState = (state: ConfirmAddressState): void =>
  setRhSessionStepState(CONFIRM_ADDRESS_STEP_STATE_KEY, state);
