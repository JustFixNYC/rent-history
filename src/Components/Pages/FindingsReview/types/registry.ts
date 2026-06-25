import { findingReviewModule as overchargeLegalrentPosthstpaModule } from "../findings/OVERCHARGE_LEGALRENT_POSTHSTPA";
import { findingReviewModule as overchargePrehstpaModule } from "../findings/OVERCHARGE_PREHSTPA";

import {
  registerFindingModule,
  type AnyFindingReviewModule,
} from "./findingModule";

export const FINDING_MODULES = {
  OVERCHARGE_PREHSTPA: registerFindingModule(overchargePrehstpaModule),
  OVERCHARGE_LEGALRENT_POSTHSTPA: registerFindingModule(
    overchargeLegalrentPosthstpaModule
  ),
} as const satisfies Record<string, AnyFindingReviewModule>;

export type FindingModuleType = keyof typeof FINDING_MODULES;
