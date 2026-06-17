import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRollbar } from "@rollbar/react";
import React, { useRef, useState, type ReactNode } from "react";

import { shouldReportErrorToRollbar } from "../api/error-reporting";

function createQueryClient(reportError: (error: unknown) => void): QueryClient {
  const onError = (error: unknown) => {
    if (!shouldReportErrorToRollbar(error)) return;
    reportError(error);
  };

  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
  });
}

export const QueryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const rollbar = useRollbar();
  const rollbarRef = useRef(rollbar);
  rollbarRef.current = rollbar;

  const [queryClient] = useState(() =>
    createQueryClient((error) => {
      rollbarRef.current.error(error as Error);
    })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
