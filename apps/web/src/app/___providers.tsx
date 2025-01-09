"use client";

import { config } from "@/lib/wagmi";
import { TrpcProvider } from "@/trpc/client";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import {
  type GetSiweMessageOptions,
  RainbowKitSiweNextAuthProvider,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { WagmiProvider } from "wagmi";
import { useTheme } from "next-themes";

import "@rainbow-me/rainbowkit/styles.css";
import { Session } from "next-auth";

const customTheme = {
  accentColor: "#f66b15",
};

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to my RainbowKit app",
});

export function Providers({
  children,
  cookies,
  session,
}: {
  children: React.ReactNode;
  cookies: string | null;
  session: Session | null;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <WagmiProvider config={config}>
      <SessionProvider refetchInterval={0} session={session}>
        <TrpcProvider cookies={cookies}>
          <RainbowKitSiweNextAuthProvider
            getSiweMessageOptions={getSiweMessageOptions}
          >
            <RainbowKitProvider
              modalSize="wide"
              theme={
                resolvedTheme === "dark"
                  ? darkTheme({
                      accentColor: customTheme.accentColor,
                      borderRadius: "medium",
                    })
                  : lightTheme({
                      accentColor: customTheme.accentColor,
                      borderRadius: "medium",
                    })
              }
              showRecentTransactions
            >
              {children} <ReactQueryDevtools initialIsOpen={false} />
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </TrpcProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}
