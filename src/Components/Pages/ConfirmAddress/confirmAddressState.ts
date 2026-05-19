import { z } from "zod";

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

export const addressStateSchema = z.object({
  streetAddress: z.string(),
  unitNumber: z.string(),
  cityStateZip: z.string(),
  longLat: z.string().nullable(),
  bbl: z.string().nullable(),
  bin: z.string().nullable(),
});

export const addressFlowStateSchema = z.enum([
  "confirmExtracted",
  "editAddress",
  "enterAddress",
  "confirmUpdated",
]);
