import { findingReviewModule as hrvdModule } from "../findings/HRVD";
import { findingReviewModule as nonregistrationOverchargeLegalrentPosthstpaCurrTenantModule } from "../findings/NONREGISTRATION_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT";
import { findingReviewModule as nonregistrationOverchargePrefrentPosthstpaCurrTenantModule } from "../findings/NONREGISTRATION_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT";
import { findingReviewModule as nonregistrationOverchargePrehstpaCurrTenantModule } from "../findings/NONREGISTRATION_OVERCHARGE_PREHSTPA_CURR_TENANT";
import { findingReviewModule as outdatedrhOverchargeLegalrentPosthstpaCurrTenantModule } from "../findings/OUTDATEDRH_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT";
import { findingReviewModule as outdatedrhOverchargePrefrentPosthstpaCurrTenantModule } from "../findings/OUTDATEDRH_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT";
import { findingReviewModule as outdatedrhOverchargePrehstpaCurrTenantModule } from "../findings/OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT";
import { findingReviewModule as overchargeExpiredleasePosthstpaCurrTenantModule } from "../findings/OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT";
import { findingReviewModule as overchargePosthstpaCurrTenantModule } from "../findings/OVERCHARGE_POSTHSTPA_CURR_TENANT";
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
  OUTDATEDRH_OVERCHARGE_PREHSTPA_CURR_TENANT: registerFindingModule(
    outdatedrhOverchargePrehstpaCurrTenantModule
  ),
  OUTDATEDRH_OVERCHARGE_PREFRENT_POSTHSTPA_CURR_TENANT: registerFindingModule(
    outdatedrhOverchargePrefrentPosthstpaCurrTenantModule
  ),
  OUTDATEDRH_OVERCHARGE_LEGALRENT_POSTHSTPA_CURR_TENANT: registerFindingModule(
    outdatedrhOverchargeLegalrentPosthstpaCurrTenantModule
  ),
  OVERCHARGE_POSTHSTPA_CURR_TENANT: registerFindingModule(
    overchargePosthstpaCurrTenantModule
  ),
  OVERCHARGE_EXPIREDLEASE_POSTHSTPA_CURR_TENANT: registerFindingModule(
    overchargeExpiredleasePosthstpaCurrTenantModule
  ),
  HRVD: registerFindingModule(hrvdModule),
  PREFRENT_421A: registerFindingModule(prefrent421aModule),
} as const satisfies Record<string, AnyFindingReviewModule>;

export type FindingModuleType = keyof typeof FINDING_MODULES;
