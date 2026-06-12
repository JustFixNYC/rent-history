import * as OVERCHARGE_PREHSTPA from "../findings/OVERCHARGE_PREHSTPA";

export const FINDING_MODULES = { OVERCHARGE_PREHSTPA } as const;

export type FindingModuleType = keyof typeof FINDING_MODULES;
