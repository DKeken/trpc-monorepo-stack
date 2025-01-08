"use client";

import {
  createTRPCReact,
  httpBatchLink,
  splitLink,
  unstable_httpSubscriptionLink,
} from "@trpc/react-query";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SuperJSON } from "superjson";
import { trpc } from ".";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: unstable_httpSubscriptionLink({
            url: `http://localhost:3333/trpc`,
            transformer: SuperJSON,
          }),
          false: httpBatchLink({
            url: "http://localhost:3333/trpc",
            transformer: SuperJSON,
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
