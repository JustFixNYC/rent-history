import { z } from "zod";
import type { RhOtpTokenResponse, RhProfile } from "../api/rhAuth";

export const RH_SESSION_STORAGE_KEY = "rh_session";

export const RH_SESSION_VERSION = 1 as const;

const rhSessionAuthSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string(),
  scope: z.string(),
  expiresAtMs: z.number().finite(),
  profile: z.custom<RhProfile>(),
});

const rhSessionFlowSchema = z.object({
  historyId: z.string().nullable(),
  scanKeys: z.array(z.string()),
  formDraft: z.unknown().nullable(),
  extensions: z.record(z.string(), z.unknown()),
  steps: z.record(z.string(), z.unknown()),
});

const rhSessionDocumentSchemaV1 = z.object({
  version: z.literal(1),
  auth: rhSessionAuthSchema.nullable(),
  flow: rhSessionFlowSchema,
});

export type RhSessionAuth = z.infer<typeof rhSessionAuthSchema>;
export type RhSessionFlow = z.infer<typeof rhSessionFlowSchema>;
export type RhSessionDocument = z.infer<typeof rhSessionDocumentSchemaV1>;

const listeners = new Set<() => void>();

export function subscribeRhSessionStorage(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyRhSessionStorage(): void {
  storeRevision += 1;
  listeners.forEach((listener) => listener());
}

export function createDefaultRhSessionDocument(): RhSessionDocument {
  return {
    version: RH_SESSION_VERSION,
    auth: null,
    flow: {
      historyId: null,
      scanKeys: [],
      formDraft: null,
      extensions: {},
      steps: {},
    },
  };
}

/** Bumped on every write/clear so useSyncExternalStore getSnapshot can return a stable reference between updates. */
let storeRevision = 0;
let snapshotAtRevision = -1;
let cachedStoreSnapshot: RhSessionDocument = createDefaultRhSessionDocument();

function migrateRhSessionRaw(raw: unknown): unknown {
  if (raw === null || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const version = candidate.version;
  if (version === 1) return candidate;
  return null;
}

/** Parse and migrate raw JSON; does not read storage or check auth alignment. */
export function parseRhSessionDocumentJson(
  raw: unknown,
): RhSessionDocument | null {
  const migrated = migrateRhSessionRaw(raw);
  if (migrated === null) return null;
  const parsed = rhSessionDocumentSchemaV1.safeParse(migrated);
  return parsed.success ? parsed.data : null;
}

export function readRhSessionDocument(): RhSessionDocument | null {
  try {
    const rawString = window.sessionStorage.getItem(RH_SESSION_STORAGE_KEY);
    if (!rawString) return null;
    const raw: unknown = JSON.parse(rawString);
    const doc = parseRhSessionDocumentJson(raw);
    if (!doc) {
      window.sessionStorage.removeItem(RH_SESSION_STORAGE_KEY);
      notifyRhSessionStorage();
      return null;
    }
    return doc;
  } catch {
    window.sessionStorage.removeItem(RH_SESSION_STORAGE_KEY);
    notifyRhSessionStorage();
    return null;
  }
}

export function getRhSessionStoreSnapshot(): RhSessionDocument {
  if (snapshotAtRevision === storeRevision) {
    return cachedStoreSnapshot;
  }
  const doc = readRhSessionDocument() ?? createDefaultRhSessionDocument();
  cachedStoreSnapshot = structuredClone(doc);
  snapshotAtRevision = storeRevision;
  return cachedStoreSnapshot;
}

const defaultServerSnapshot = createDefaultRhSessionDocument();

export function getRhSessionStoreServerSnapshot(): RhSessionDocument {
  return defaultServerSnapshot;
}

export function writeRhSessionDocument(doc: RhSessionDocument): void {
  const validated = rhSessionDocumentSchemaV1.parse(doc);
  window.sessionStorage.setItem(
    RH_SESSION_STORAGE_KEY,
    JSON.stringify(validated),
  );
  notifyRhSessionStorage();
}

export function clearRhSessionDocument(): void {
  window.sessionStorage.removeItem(RH_SESSION_STORAGE_KEY);
  notifyRhSessionStorage();
}

export function patchRhSessionDocument(
  updater: (draft: RhSessionDocument) => void,
): RhSessionDocument {
  const current = readRhSessionDocument() ?? createDefaultRhSessionDocument();
  const draft = structuredClone(current);
  updater(draft);
  const validated = rhSessionDocumentSchemaV1.parse(draft);
  writeRhSessionDocument(validated);
  return validated;
}

export const setRhAuthSession = (
  payload: RhOtpTokenResponse,
  nowMs = Date.now(),
): RhSessionAuth => {
  const auth: RhSessionAuth = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    tokenType: payload.token_type,
    scope: payload.scope,
    expiresAtMs: nowMs + payload.expires_in * 1000,
    profile: payload.profile,
  };

  patchRhSessionDocument((draft) => {
    draft.auth = auth;
  });
  return auth;
};

export const getRhAuthSession = (nowMs = Date.now()): RhSessionAuth | null => {
  const auth = readRhSessionDocument()?.auth ?? null;
  if (!auth) return null;
  if (auth.expiresAtMs <= nowMs) {
    clearRhAuthSession();
    return null;
  }
  return auth;
};

export const clearRhAuthSession = (): void => {
  patchRhSessionDocument((draft) => {
    draft.auth = null;
  });
};

export const getValidRhAccessToken = (nowMs = Date.now()): string | null => {
  const auth = getRhAuthSession(nowMs);
  return auth ? auth.accessToken : null;
};

export const setRhHistoryId = (historyId: string): void => {
  patchRhSessionDocument((draft) => {
    draft.flow.historyId = historyId;
  });
};

export const getRhHistoryId = (): string | null =>
  readRhSessionDocument()?.flow.historyId ?? null;

export const clearRhHistoryId = (): void => {
  patchRhSessionDocument((draft) => {
    draft.flow.historyId = null;
  });
};

export function appendRhSessionScanKey(key: string): void {
  const session = getRhAuthSession();
  const historyId = getRhHistoryId();
  if (!session || !historyId) return;

  patchRhSessionDocument((draft) => {
    draft.flow.scanKeys = [...draft.flow.scanKeys, key];
  });
}

export function replaceRhSessionScanKeys(keys: string[]): void {
  patchRhSessionDocument((draft) => {
    draft.flow.scanKeys = [...keys];
    const session = getRhAuthSession();
    const historyId = getRhHistoryId();
    if (session && historyId) {
      draft.flow.historyId = historyId;
    }
  });
}

export function clearRhSessionScanKeys(): void {
  patchRhSessionDocument((draft) => {
    draft.flow.scanKeys = [];
  });
}

export function setRhSessionFormDraft(formDraft: unknown | null): void {
  patchRhSessionDocument((draft) => {
    draft.flow.formDraft = formDraft;
  });
}

export function setRhSessionExtension(
  extensionId: string,
  value: unknown,
): void {
  patchRhSessionDocument((draft) => {
    draft.flow.extensions = { ...draft.flow.extensions, [extensionId]: value };
  });
}

export function removeRhSessionExtension(extensionId: string): void {
  patchRhSessionDocument((draft) => {
    const next = { ...draft.flow.extensions };
    delete next[extensionId];
    draft.flow.extensions = next;
  });
}

export function setRhSessionStepState(stepId: string, value: unknown): void {
  patchRhSessionDocument((draft) => {
    draft.flow.steps = { ...draft.flow.steps, [stepId]: value };
  });
}

export function getRhSessionStepState<T>(
  stepId: string,
  schema: z.ZodType<T>,
): T | null {
  const value = readRhSessionDocument()?.flow.steps[stepId];
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
