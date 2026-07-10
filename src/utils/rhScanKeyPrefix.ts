import {
  getRhAuthSession,
  type RhSessionPage,
} from "../session/rhSessionStorage";

export function getRhScanKeyPrefix(historyId: string): string | null {
  const session = getRhAuthSession();
  if (!session) return null;
  return `${session.profile.id}/${historyId}`;
}

export function sessionPagesMatchHistory(
  pages: RhSessionPage[],
  historyId: string
): boolean {
  const prefix = getRhScanKeyPrefix(historyId);
  if (!prefix || pages.length === 0) return false;
  return pages.every((page) => page.s3_key.startsWith(`${prefix}/`));
}
