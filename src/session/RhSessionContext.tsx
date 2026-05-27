import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { RhAnalysisPage } from "../api/rhAuth";
import {
  clearRhSessionDocument,
  clearRhSessionPages,
  getRhSessionStoreServerSnapshot,
  getRhSessionStoreSnapshot,
  patchRhSessionDocument,
  removeRhSessionExtension,
  type RhSessionDocument,
  setRhSessionAnalysisPages,
  setRhSessionExtension,
  setRhSessionFormDraft,
  subscribeRhSessionStorage,
} from "./rhSessionStorage";

export type RhSessionContextValue = {
  document: RhSessionDocument;
  patchDocument: (
    updater: (draft: RhSessionDocument) => void
  ) => RhSessionDocument;
  clearDocument: () => void;
  setAnalysisPages: (pages: RhAnalysisPage[]) => void;
  clearPages: () => void;
  setFormDraft: (draft: unknown | null) => void;
  setExtension: (extensionId: string, value: unknown) => void;
  removeExtension: (extensionId: string) => void;
};

const RhSessionContext = createContext<RhSessionContextValue | null>(null);

export const RhSessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const document = useSyncExternalStore(
    subscribeRhSessionStorage,
    getRhSessionStoreSnapshot,
    getRhSessionStoreServerSnapshot
  );

  const patchDocument = useCallback(
    (updater: (draft: RhSessionDocument) => void) =>
      patchRhSessionDocument(updater),
    []
  );

  const clearDocument = useCallback(() => clearRhSessionDocument(), []);

  const setAnalysisPages = useCallback(
    (pages: RhAnalysisPage[]) => setRhSessionAnalysisPages(pages),
    []
  );

  const clearPages = useCallback(() => clearRhSessionPages(), []);

  const setFormDraft = useCallback(
    (draft: unknown | null) => setRhSessionFormDraft(draft),
    []
  );

  const setExtension = useCallback(
    (extensionId: string, value: unknown) =>
      setRhSessionExtension(extensionId, value),
    []
  );

  const removeExtension = useCallback(
    (extensionId: string) => removeRhSessionExtension(extensionId),
    []
  );

  const value = useMemo(
    () => ({
      document,
      patchDocument,
      clearDocument,
      setAnalysisPages,
      clearPages,
      setFormDraft,
      setExtension,
      removeExtension,
    }),
    [
      document,
      patchDocument,
      clearDocument,
      setAnalysisPages,
      clearPages,
      setFormDraft,
      setExtension,
      removeExtension,
    ]
  );

  return (
    <RhSessionContext.Provider value={value}>
      {children}
    </RhSessionContext.Provider>
  );
};

/** Colocated with provider so both share one context instance. */
// eslint-disable-next-line react-refresh/only-export-components -- hook must live next to provider
export function useRhSession(): RhSessionContextValue {
  const context = useContext(RhSessionContext);
  if (!context) {
    throw new Error("useRhSession must be used within a RhSessionProvider");
  }
  return context;
}
