# Session Storage (`rh_session`)

This directory contains the client-side session storage system for rent-history.

## Goals

- Keep all frontend session state in one `sessionStorage` key: `rh_session`
- Use typed slices for safety and maintainability
- Make it easy to add new flow data without redesigning storage

## Document shape

`rhSessionStorage.ts` stores a versioned document:

- `version`: schema version (`1` currently)
- `auth`: OTP auth session (`accessToken`, `refreshToken`, `tokenType`, `scope`, `expiresAtMs`, `profile`) or `null`
- `flow`:
  - `historyId`
  - `scanKeys`
  - `formDraft`
  - `extensions` (feature-owned JSON)
  - `steps` (future flow stage state)

## Main APIs

- Auth:
  - `setRhAuthSession()`
  - `getRhAuthSession()`
  - `clearRhAuthSession()`
  - `getValidRhAccessToken()`
- Flow:
  - `setRhHistoryId()`, `getRhHistoryId()`, `clearRhHistoryId()`
  - `appendRhSessionScanKey()`, `replaceRhSessionScanKeys()`, `clearRhSessionScanKeys()`
  - `setRhSessionFormDraft()`
  - `setRhSessionExtension()`, `removeRhSessionExtension()`
  - `setRhSessionStepState()`, `getRhSessionStepState()`

## Rules for developers

- Do not write directly to `window.sessionStorage` for rent-history flow/auth state.
- Always go through `rhSessionStorage.ts` helpers.
- When adding a new slice:
  1. Add/update Zod schema in `rhSessionStorage.ts`
  2. Add dedicated getter/setter helpers
  3. Add tests in `rhSessionStorage.test.ts`
- Keep stored values JSON-serializable and small.
- Binary data (images) should remain in S3; store only keys in session.

## Versioning and migrations

- The session document includes a top-level `version` field (`1` today).
- Parsing is centralized in `parseRhSessionDocumentJson()` and migration routing is in `migrateRhSessionRaw()` inside `rhSessionStorage.ts`.
- Current policy is a **clean cutover**:
  - only the current version is accepted
  - unknown/legacy shapes are treated as invalid
  - invalid documents are cleared and reset to the default v1 shape on next write
- This is intentional while the app is pre-production and schema is still evolving quickly.

### How to introduce a new version

When changing persisted shape:

1. Bump `RH_SESSION_VERSION`.
2. Add a new Zod schema for the new version.
3. Update `migrateRhSessionRaw()` to either:
   - transform older shapes to the new shape, or
   - keep clean-cutover behavior (return invalid for old shapes).
4. Update `createDefaultRhSessionDocument()` to the new canonical shape.
5. Add tests for:
   - valid parse of the new version
   - behavior for old/unknown versions (migrate or clear)
   - critical auth/flow invariants after migration/reset.

## React integration

- `RhSessionProvider` and `useRhSession()` in `RhSessionContext.tsx` expose the storage-backed state to React components.
- For one-off reads/writes, importing helper functions directly from `rhSessionStorage.ts` is also acceptable.
