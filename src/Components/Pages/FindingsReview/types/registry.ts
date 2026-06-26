import { findingReviewModule as hrvdModule } from "../findings/HRVD";
import { findingReviewModule as nonregistrationPosthstpaModule } from "../findings/NONREGISTRATION_POSTHSTPA";
import { findingReviewModule as nonregistrationPrefrentPosthstpaModule } from "../findings/NONREGISTRATION_PREFRENT_POSTHSTPA";
import { findingReviewModule as nonregistrationPrehstpaModule } from "../findings/NONREGISTRATION_PREHSTPA";
import { findingReviewModule as overchargeLegalrentPosthstpaModule } from "../findings/OVERCHARGE_LEGALRENT_POSTHSTPA";
import { findingReviewModule as overchargePrefrentPosthstpaModule } from "../findings/OVERCHARGE_PREFRENT_POSTHSTPA";
import { findingReviewModule as overchargePrefrentremovedPosthstpaModule } from "../findings/OVERCHARGE_PREFRENTREMOVED_POSTHSTPA";
import { findingReviewModule as overchargePrehstpaModule } from "../findings/OVERCHARGE_PREHSTPA";
import { findingReviewModule as prefrent421aModule } from "../findings/PREFRENT_421A";

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
  OVERCHARGE_PREFRENTREMOVED_POSTHSTPA: registerFindingModule(
    overchargePrefrentremovedPosthstpaModule
  ),
  NONREGISTRATION_PREHSTPA: registerFindingModule(
    nonregistrationPrehstpaModule
  ),
  NONREGISTRATION_POSTHSTPA: registerFindingModule(
    nonregistrationPosthstpaModule
  ),
  NONREGISTRATION_PREFRENT_POSTHSTPA: registerFindingModule(
    nonregistrationPrefrentPosthstpaModule
  ),
  HRVD: registerFindingModule(hrvdModule),
  PREFRENT_421A: registerFindingModule(prefrent421aModule),
} as const satisfies Record<string, AnyFindingReviewModule>;

export type FindingModuleType = keyof typeof FINDING_MODULES;
