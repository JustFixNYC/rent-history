import { z } from "zod";

import {
  getRhSessionStepState,
  setRhSessionStepState,
} from "../../../session/rhSessionStorage";
import {
  addressFlowStateSchema,
  addressStateSchema,
  AddressFlowState,
  AddressState,
  EXTRACTED_ADDRESS,
  UPDATED_ADDRESS,
} from "../ConfirmAddress/confirmAddressState";

export type { AddressFlowState, AddressState };
export { EXTRACTED_ADDRESS, UPDATED_ADDRESS };

export type RentQuestionsState = {
  monthlyRent: string;
};

export type PostScanFlowState = {
  addressFlowState: AddressFlowState;
  confirmedAddress: AddressState;
  draftAddress: AddressState;
  rentQuestions: RentQuestionsState;
};

const DEFAULT_STATE: PostScanFlowState = {
  addressFlowState: "confirmExtracted",
  confirmedAddress: EXTRACTED_ADDRESS,
  draftAddress: { ...EXTRACTED_ADDRESS, unitNumber: "" },
  rentQuestions: {
    monthlyRent: "",
  },
};

const rentQuestionsStateSchema = z.object({
  monthlyRent: z.string(),
});

const postScanStateSchema = z.object({
  addressFlowState: addressFlowStateSchema,
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
