import NextAuth, { type NextAuthConfig } from "next-auth";
import credentialsProvider from "next-auth/providers/credentials";
import {
  verifySignature,
  getChainIdFromMessage,
  getAddressFromMessage,
} from "@reown/appkit-siwe";
import "./types";

export const getNextAuthConfig = ({
  nextAuthSecret,
  projectId,
}: {
  nextAuthSecret: string;
  projectId: string;
}) => {
  const providers = [
    credentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            throw new Error("SiweMessage or signature is undefined");
          }
          const message = credentials.message as string;
          const signature = credentials.signature as string;
          const address = getAddressFromMessage(message);
          const chainId = getChainIdFromMessage(message);

          const isValid = await verifySignature({
            address,
            message,
            signature,
            chainId,
            projectId,
          });

          if (isValid) {
            return {
              id: `${chainId}:${address}`,
              address,
              chainId,
            };
          }

          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ];

  const config: NextAuthConfig = {
    secret: nextAuthSecret,
    providers,
    session: {
      strategy: "jwt",
    },
    callbacks: {
      jwt({ token, user }) {
        if (user?.address) {
          token.address = user.address;
          token.chainId = user.chainId;
        }
        return token;
      },
      session({ session, token }) {
        if (!token.sub) {
          return session;
        }

        if (token.address && token.chainId) {
          session.address = token.address as string;
          session.chainId = token.chainId as number;
        }

        return session;
      },
    },
  };

  return config;
};

export const createAuthInstance = ({
  nextAuthSecret,
  projectId,
}: {
  nextAuthSecret: string;
  projectId: string;
}) => {
  return NextAuth(getNextAuthConfig({ nextAuthSecret, projectId }));
};

export * from "./types";
