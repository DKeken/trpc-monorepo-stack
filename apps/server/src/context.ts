import { db } from "@app/database";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getToken } from "next-auth/jwt";

/**
 * Creates context for an incoming request
 * @see https://trpc.io/docs/v11/context
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  try {
    const token = await getToken({
      req: opts.req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    return {
      token,
      db,
    };
  } catch (error) {
    console.error("JWT validation error:", error);
    throw error;
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;
