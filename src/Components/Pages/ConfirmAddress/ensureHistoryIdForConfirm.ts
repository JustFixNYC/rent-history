import { createRhHistory } from "../../../api/account";
import {
  getRhHistoryId,
  setRhHistoryId,
} from "../../../session/rhSessionStorage";

/**
 * Ensures a flow history id exists before confirm-address.
 * Call only from map preview Next — never on mount or entry Continue.
 */
export async function ensureHistoryIdForConfirm(
  accessToken: string
): Promise<string> {
  const existing = getRhHistoryId();
  if (existing) return existing;
  const created = await createRhHistory(accessToken);
  setRhHistoryId(created.id);
  return created.id;
}
