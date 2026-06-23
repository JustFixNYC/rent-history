/** UI aliases for OpenAPI-derived wire types — single source in `api/account/types`. */

import type { RhFindingStatusEnum } from "../../../../api/account/types";

export type {
  RhFinding as Finding,
  RhFindingData as FindingData,
  RhFindingKey as FindingKey,
  RhFindingResult as FindingResult,
  RhFindingRow as FindingDataRow,
  RhFindingStatusEnum as FindingStatus,
  RhFindingsStateResponse as FindingsStateResponse,
  RhQueueDelta as QueueDelta,
  RhReviewQueue as ReviewQueue,
  RhValidateFindingAnswersRequest as ValidateFindingAnswers,
  RhValidateFindingRequestRequest as ValidateFindingRequest,
  RhValidateFindingResponse as ValidateFindingResponse,
} from "../../../../api/account/types";

export const FINDING_STATUSES = [
  "pending",
  "validated",
  "dismissed",
] as const satisfies readonly RhFindingStatusEnum[];
