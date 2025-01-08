"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TrpcProvider } from "@/trpc/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrpcProvider>
      {children} <ReactQueryDevtools initialIsOpen={false} />
    </TrpcProvider>
  );
}
