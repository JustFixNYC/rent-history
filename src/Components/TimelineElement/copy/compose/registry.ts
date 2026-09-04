import type { TimelineFindingType } from "../../types";
import { composeDestabSubRehabPosthstpa } from "./destabSubRehabPosthstpa";
import { composeMissingReg } from "./missingReg";
import { composeNoFinding } from "./noFinding";
import { composePref421aViol } from "./pref421aViol";
import { composeStillStab } from "./stillStab";
import { composeTempExemption } from "./tempExemption";
import { composeDestabNoViolPrehstpa } from "./destabNoViolPrehstpa";
import { composeDestabViolPosthstpa } from "./destabViolPosthstpa";
import { composeDestabViolPrehstpa } from "./destabViolPrehstpa";
import { composeIncreaseLegalViolPosthstpa } from "./increaseLegalViolPosthstpa";
import { composeIncreaseNoViolPrehstpa } from "./increaseNoViolPrehstpa";
import { composeIncreasePrefNoViolPosthstpa } from "./increasePrefNoViolPosthstpa";
import { composeIncreasePrefViolPosthstpa } from "./increasePrefViolPosthstpa";
import { composeIncreaseViolPrehstpa } from "./increaseViolPrehstpa";
import { composeNonregNoViolPosthstpa } from "./nonregNoViolPosthstpa";
import { composeNonregNoViolSameTenant } from "./nonregNoViolSameTenant";
import { composeNonregViolPosthstpaNewTenant } from "./nonregViolPosthstpaNewTenant";
import { composeNonregViolPosthstpaOvercharge } from "./nonregViolPosthstpaOvercharge";
import { composeNonregViolPrehstpaNewTenant } from "./nonregViolPrehstpaNewTenant";
import { composeNonregViolPrehstpaSameTenant } from "./nonregViolPrehstpaSameTenant";
import { composeRevokePrefViolPosthstpa } from "./revokePrefViolPosthstpa";
import type { TimelineComposer } from "./types";

export const timelineComposers: Record<TimelineFindingType, TimelineComposer> =
  {
    destab__viol__prehstpa: composeDestabViolPrehstpa,
    destab__no_viol__prehstpa: composeDestabNoViolPrehstpa,
    destab__viol__posthstpa: composeDestabViolPosthstpa,
    nonreg__viol__prehstpa__new_tenant: composeNonregViolPrehstpaNewTenant,
    nonreg__viol__prehstpa__same_tenant: composeNonregViolPrehstpaSameTenant,
    nonreg__no_viol__same_tenant: composeNonregNoViolSameTenant,
    increase__viol__prehstpa: composeIncreaseViolPrehstpa,
    increase__no_viol__prehstpa: composeIncreaseNoViolPrehstpa,
    nonreg__viol__posthstpa__new_tenant: composeNonregViolPosthstpaNewTenant,
    nonreg__viol__posthstpa__overcharge: composeNonregViolPosthstpaOvercharge,
    nonreg__no_viol__posthstpa: composeNonregNoViolPosthstpa,
    increase_legal__viol__posthstpa: composeIncreaseLegalViolPosthstpa,
    increase_pref__viol__posthstpa: composeIncreasePrefViolPosthstpa,
    increase_pref__no_viol__posthstpa: composeIncreasePrefNoViolPosthstpa,
    revoke_pref__viol__posthstpa: composeRevokePrefViolPosthstpa,
    pref_421a__viol: composePref421aViol,
    missing_reg: composeMissingReg,
    temp_exemption: composeTempExemption,
    still_stab: composeStillStab,
    destab__sub_rehab__posthstpa: composeDestabSubRehabPosthstpa,
    no_finding: composeNoFinding,
  };
