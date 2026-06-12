import { findingReviewModule as overchargePrehstpaModule } from "../findings/OVERCHARGE_PREHSTPA";

import {
  registerFindingModule,
  type AnyFindingReviewModule,
} from "./findingModule";

export const FINDING_MODULES = {
  OVERCHARGE_PREHSTPA: registerFindingModule(overchargePrehstpaModule),
} as const satisfies Record<string, AnyFindingReviewModule>;

export type FindingModuleType = keyof typeof FINDING_MODULES;
