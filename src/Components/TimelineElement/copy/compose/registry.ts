import type { TimelineFindingType } from "../../types";
import { composeNoViolationDestabPrehstpa } from "./noViolationDestabPrehstpa";
import { composeNonregistrationPosthstpaNewTenant } from "./nonregistrationPosthstpaNewTenant";
import type { TimelineComposer } from "./types";
import { composeViolationDestabPosthstpa } from "./violationDestabPosthstpa";
import { composeViolationDestabPrehstpa } from "./violationDestabPrehstpa";

export const timelineComposers: Record<TimelineFindingType, TimelineComposer> =
  {
    violation__destab__prehstpa: composeViolationDestabPrehstpa,
    no_violation__destab__prehstpa: composeNoViolationDestabPrehstpa,
    violation__destab__posthstpa: composeViolationDestabPosthstpa,
    nonregistration__posthstpa__new_tenant:
      composeNonregistrationPosthstpaNewTenant,
  };
