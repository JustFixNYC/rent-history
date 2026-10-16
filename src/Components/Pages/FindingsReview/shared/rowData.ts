import type { Finding } from "../types/finding";

/** Display-only tenant names on a finding data row. */
export function getRowTenants(finding: Finding, rowIndex: number): string[] {
  return finding.data.rows[rowIndex]?.tenants?.filter(Boolean) ?? [];
}
