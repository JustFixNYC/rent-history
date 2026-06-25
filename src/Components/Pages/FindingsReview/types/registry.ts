import { findingReviewModule as hrvdModule } from "../findings/HRVD";
import { findingReviewModule as nonregistrationPrehstpaModule } from "../findings/NONREGISTRATION_PREHSTPA";
import { findingReviewModule as overchargeLegalrentPosthstpaModule } from "../findings/OVERCHARGE_LEGALRENT_POSTHSTPA";
import { findingReviewModule as overchargePrefrentPosthstpaModule } from "../findings/OVERCHARGE_PREFRENT_POSTHSTPA";
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
  OVERCHARGE_PREFRENT_POSTHSTPA: registerFindingModule(
    overchargePrefrentPosthstpaModule
  ),
  NONREGISTRATION_PREHSTPA: registerFindingModule(
    nonregistrationPrehstpaModule
  ),
  HRVD: registerFindingModule(hrvdModule),
} as const satisfies Record<string, AnyFindingReviewModule>;

export type FindingModuleType = keyof typeof FINDING_MODULES;
