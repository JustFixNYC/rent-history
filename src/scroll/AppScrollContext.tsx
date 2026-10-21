import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import {
  scrollAppContainerToTop,
  type AppScrollToTopOptions,
} from "./scrollToTop";

type AppScrollContextValue = {
  containerRef: RefObject<HTMLElement | null>;
  scrollToTop: (options?: AppScrollToTopOptions) => void;
};

const AppScrollContext = createContext<AppScrollContextValue | null>(null);

type AppScrollProviderProps = {
  children: ReactNode;
  containerRef?: RefObject<HTMLElement | null>;
};

export function AppScrollProvider({
  children,
  containerRef: containerRefProp,
}: AppScrollProviderProps) {
  const internalRef = useRef<HTMLElement | null>(null);
  const containerRef = containerRefProp ?? internalRef;

  const scrollToTop = useCallback(
    (options?: AppScrollToTopOptions) => {
      scrollAppContainerToTop(containerRef, options);
    },
    [containerRef]
  );

  const value = useMemo(
    () => ({ containerRef, scrollToTop }),
    [containerRef, scrollToTop]
  );

  return (
    <AppScrollContext.Provider value={value}>
      {children}
    </AppScrollContext.Provider>
  );
}

const fallbackContainerRef = { current: null as HTMLElement | null };

/** Prefer `AppScrollProvider`; without it, scroll targets `#main` via DOM lookup. */
export function useAppScroll(): AppScrollContextValue {
  const context = useContext(AppScrollContext);

  const scrollToTop = useCallback(
    (options?: AppScrollToTopOptions) => {
      scrollAppContainerToTop(context?.containerRef, options);
    },
    [context]
  );

  if (context) {
    return context;
  }

  return {
    containerRef: fallbackContainerRef,
    scrollToTop,
  };
}
