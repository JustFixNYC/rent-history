import { z } from "zod";

import {
  getRhSessionStepState,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";

export type AddressFlowState = "enterAddress" | "confirmUpdated";

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

/** Fingerprint of the address last successfully confirmed on the server. */
export const addressCommitKey = (address: AddressState): string =>
  JSON.stringify({
    street: address.streetAddress.trim(),
    unit: address.unitNumber.trim(),
    bbl: address.bbl,
    bin: address.bin,
  });

export type ConfirmAddressState = {
  addressFlowState: AddressFlowState;
  confirmedAddress: AddressState;
  draftAddress: AddressState;
  /** Set after a successful confirm-address (or rebuilt on resume). */
  serverConfirmedKey: string | null;
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
  addressFlowState: z.enum(["enterAddress", "confirmUpdated"]),
  confirmedAddress: addressStateSchema,
  draftAddress: addressStateSchema,
  serverConfirmedKey: z.string().nullable().default(null),
});

export const CONFIRM_ADDRESS_STEP_STATE_KEY = "confirmAddress";

export const readConfirmAddressState = (): ConfirmAddressState | null =>
  getRhSessionStepState(
    CONFIRM_ADDRESS_STEP_STATE_KEY,
    confirmAddressStateSchema
  ) ?? null;

export const writeConfirmAddressState = (state: ConfirmAddressState): void =>
  setRhSessionStepState(CONFIRM_ADDRESS_STEP_STATE_KEY, state);
