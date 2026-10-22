import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import type { RhEarlyValidation } from "../../../api/account/types";
import type { ScanReviewLocationState } from "../Scanner/scannerLocationState";
import {
  ScanReviewEntryScreen,
  ScanReviewMode,
  ScanReviewRecoveryVariant,
  type ScanReviewRecoveryVariant as ScanReviewRecoveryVariantType,
} from "./scanReviewModes";

export type RecoveryActionConfig = {
  label: MessageDescriptor;
  icon?: "cameraRegular";
};

export type RecoveryScreenConfig = {
  variant: ScanReviewRecoveryVariantType;
  title: MessageDescriptor;
  body: MessageDescriptor;
  primaryAction: RecoveryActionConfig;
  secondaryAction?: RecoveryActionConfig;
};

/** Entry screen: incremental flow, warning-only path. */
export type ScanReviewWarningOnlyFlowState = {
  screen: typeof ScanReviewEntryScreen.incrementalFlow;
  flowMode: typeof ScanReviewMode.warningOnly;
  earlyValidation: RhEarlyValidation;
};

export type ScanReviewIncrementalFlowState = ScanReviewWarningOnlyFlowState;

export type ScanReviewRecoveryScreenState = {
  screen:
    | typeof ScanReviewEntryScreen.unknownError
    | typeof ScanReviewEntryScreen.combinedFullRescan
    | typeof ScanReviewEntryScreen.allNeedsRescan;
  recoveryConfig: RecoveryScreenConfig;
};

/** Entry screen: partial page errors with Page N callout. */
export type ScanReviewPartialPageErrorsState = {
  screen: typeof ScanReviewEntryScreen.partialPageErrors;
  labels: string[];
};

/** Entry screen: unrecoverable total failure. */
export type ScanReviewTotalFailureState = {
  screen: typeof ScanReviewEntryScreen.totalFailure;
};

export type ScanReviewScreenState =
  | ScanReviewRecoveryScreenState
  | ScanReviewIncrementalFlowState
  | ScanReviewPartialPageErrorsState
  | ScanReviewTotalFailureState;

export type ScanReviewResolverOptions = {
  skipLastRegYearStep?: boolean;
  scanPipelineStatus?: string | null;
};

const RECOVERY_SCREEN_CONFIGS: Record<
  ScanReviewRecoveryVariantType,
  RecoveryScreenConfig
> = {
  [ScanReviewRecoveryVariant.combined]: {
    variant: ScanReviewRecoveryVariant.combined,
    title: msg`We weren't able to capture all of your rent history`,
    body: msg`Some pages could not be read, and we may be missing part of your rent history. Please re-scan your full document.`,
    primaryAction: {
      label: msg`Re-scan document`,
      icon: "cameraRegular",
    },
  },
  [ScanReviewRecoveryVariant.allNeedsRescan]: {
    variant: ScanReviewRecoveryVariant.allNeedsRescan,
    title: msg`We weren't able to read your document`,
    body: msg`Your scan may be unclear or you may have scanned the wrong document. Please verify you are scanning a rent history registration printout from the Division of Housing and Community Renewal (DHCR).`,
    primaryAction: {
      label: msg`Re-scan document`,
      icon: "cameraRegular",
    },
    secondaryAction: {
      label: msg`Request rent history`,
    },
  },
  [ScanReviewRecoveryVariant.unknown]: {
    variant: ScanReviewRecoveryVariant.unknown,
    title: msg`Something went wrong`,
    body: msg`We couldn't finish processing your scans. Please come back later and try again from your account.`,
    primaryAction: {
      label: msg`Come back later`,
    },
  },
};

export function getRecoveryScreenConfig(
  variant: ScanReviewRecoveryVariantType
): RecoveryScreenConfig {
  return RECOVERY_SCREEN_CONFIGS[variant];
}

function buildRecoveryScreenState(
  screen:
    | typeof ScanReviewEntryScreen.unknownError
    | typeof ScanReviewEntryScreen.combinedFullRescan
    | typeof ScanReviewEntryScreen.allNeedsRescan,
  variant: ScanReviewRecoveryVariantType
): ScanReviewRecoveryScreenState {
  return {
    screen,
    recoveryConfig: getRecoveryScreenConfig(variant),
  };
}

export function isNonPipelineScanReviewEntry(
  locationState: ScanReviewLocationState | null | undefined
): boolean {
  if (!locationState) return false;
  return Boolean(
    locationState.showLaunchFailure ||
      (locationState.failedUploadCount ?? 0) > 0 ||
      locationState.reviewError ||
      locationState.awaitingRescanSuccess
  );
}

export function hasScanReviewWarning(
  earlyValidation: RhEarlyValidation
): boolean {
  return earlyValidation.warnings.length > 0;
}

export function hasPossibleMissingLastPageWarning(
  earlyValidation: RhEarlyValidation
): boolean {
  return earlyValidation.warnings.some(
    (warning) => warning.code === "possible_missing_last_page"
  );
}

export function isWarningStepEligible(
  earlyValidation: RhEarlyValidation
): boolean {
  return (
    hasScanReviewWarning(earlyValidation) &&
    earlyValidation.scanned_max_reg_year != null
  );
}

export function getLabelableRescanLabels(
  earlyValidation: RhEarlyValidation
): string[] {
  return earlyValidation.pages_needing_rescan.flatMap((page) =>
    page.label ? [page.label] : []
  );
}

export function isAllPagesNeedRescan(
  earlyValidation: RhEarlyValidation
): boolean {
  if (earlyValidation.scanned_max_reg_year != null) return false;
  if (earlyValidation.pages_needing_rescan.length === 0) return false;
  return getLabelableRescanLabels(earlyValidation).length === 0;
}

export function isCombinedFullRescan(
  earlyValidation: RhEarlyValidation,
  skipLastRegYearStep: boolean
): boolean {
  if (earlyValidation.passed) return false;
  if (skipLastRegYearStep) return false;
  if (!hasPossibleMissingLastPageWarning(earlyValidation)) return false;

  const hasRescanSignals =
    earlyValidation.missing_page_numbers.length > 0 ||
    getLabelableRescanLabels(earlyValidation).length > 0;

  return hasRescanSignals;
}

/**
 * Resolves the scan-review **entry screen** from pipeline early_validation and
 * router location state.
 *
 * Priority: unknown → combined → allNeedsRescan → totalFailure → partial →
 * incremental flow. `warningYearMismatch` is a flow-local phase inside
 * `ScanReviewFlow` after Continue — not resolved here.
 */
export function resolveScanReviewScreen(
  locationState: ScanReviewLocationState | null | undefined,
  earlyValidation: RhEarlyValidation | null | undefined,
  options: ScanReviewResolverOptions = {}
): ScanReviewScreenState {
  const skipLastRegYearStep = options.skipLastRegYearStep ?? false;

  if (isNonPipelineScanReviewEntry(locationState)) {
    return buildRecoveryScreenState(
      ScanReviewEntryScreen.unknownError,
      ScanReviewRecoveryVariant.unknown
    );
  }

  if (options.scanPipelineStatus === "failed") {
    return buildRecoveryScreenState(
      ScanReviewEntryScreen.unknownError,
      ScanReviewRecoveryVariant.unknown
    );
  }

  if (!earlyValidation) {
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  if (isCombinedFullRescan(earlyValidation, skipLastRegYearStep)) {
    return buildRecoveryScreenState(
      ScanReviewEntryScreen.combinedFullRescan,
      ScanReviewRecoveryVariant.combined
    );
  }

  if (isAllPagesNeedRescan(earlyValidation)) {
    return buildRecoveryScreenState(
      ScanReviewEntryScreen.allNeedsRescan,
      ScanReviewRecoveryVariant.allNeedsRescan
    );
  }

  const warningPresent = hasScanReviewWarning(earlyValidation);

  if (warningPresent && !isWarningStepEligible(earlyValidation)) {
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  if (earlyValidation.passed) {
    if (warningPresent) {
      return {
        screen: ScanReviewEntryScreen.incrementalFlow,
        flowMode: ScanReviewMode.warningOnly,
        earlyValidation,
      };
    }
    return { screen: ScanReviewEntryScreen.totalFailure };
  }

  const labels = getLabelableRescanLabels(earlyValidation);
  if (labels.length > 0) {
    return {
      screen: ScanReviewEntryScreen.partialPageErrors,
      labels,
    };
  }

  return { screen: ScanReviewEntryScreen.totalFailure };
}
