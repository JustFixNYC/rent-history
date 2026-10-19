import { findingReviewModule as hrvdModule } from "../findings/HRVD";
import { findingReviewModule as nonregistrationPosthstpaModule } from "../findings/NONREGISTRATION_POSTHSTPA";
import { findingReviewModule as nonregistrationPrefrentPosthstpaModule } from "../findings/NONREGISTRATION_PREFRENT_POSTHSTPA";
import { findingReviewModule as nonregistrationOverchargeLegalrentPosthstpaCurrTenantModule } from "../findings/NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT";
import { findingReviewModule as nonregistrationOverchargePrefrentPosthstpaCurrTenantModule } from "../findings/NONREGISTRATION_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT";
import { findingReviewModule as nonregistrationOverchargePrehstpaCurrTenantModule } from "../findings/NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT";
import { findingReviewModule as oudatedrhOverchargePrehstpaCurrTenantModule } from "../findings/OUDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT";
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
  NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT: registerFindingModule(
    nonregistrationOverchargePrehstpaCurrTenantModule
  ),
  NONREGISTRATION_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT:
    registerFindingModule(
      nonregistrationOverchargePrefrentPosthstpaCurrTenantModule
    ),
  NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT:
    registerFindingModule(
      nonregistrationOverchargeLegalrentPosthstpaCurrTenantModule
    ),
  OUDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT: registerFindingModule(
    oudatedrhOverchargePrehstpaCurrTenantModule
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
