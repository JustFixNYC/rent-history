import { createContext, useContext, type ReactNode } from "react";

type FindingReviewInteractionLockContextValue = {
  locked: boolean;
};

const FindingReviewInteractionLockContext =
  createContext<FindingReviewInteractionLockContextValue>({ locked: false });

export type FindingReviewInteractionLockProviderProps = {
  locked: boolean;
  children: ReactNode;
};

export function FindingReviewInteractionLockProvider({
  locked,
  children,
}: FindingReviewInteractionLockProviderProps) {
  return (
    <FindingReviewInteractionLockContext.Provider value={{ locked }}>
      {children}
    </FindingReviewInteractionLockContext.Provider>
  );
}

export function useFindingReviewInteractionLock(): FindingReviewInteractionLockContextValue {
  return useContext(FindingReviewInteractionLockContext);
}
