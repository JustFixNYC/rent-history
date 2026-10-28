import { useRhSession } from "../../../session/RhSessionContext";
import { readConfirmAddressState } from "../ConfirmAddress/confirmAddressState";

import {
  formatReportAddressLines,
  type ReportAddressLines,
} from "./formatReportAddressLines";

export type { ReportAddressLines };

export const useReportAddressLines = (): ReportAddressLines => {
  useRhSession();
  return formatReportAddressLines(readConfirmAddressState());
};
